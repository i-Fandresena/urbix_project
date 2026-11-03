#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

readonly APP_ROOT=/home/laverta/app
readonly ENV_FILE=/home/laverta/.env
readonly INVENTORY_DIR=/home/laverta/inventory
readonly BACKUP_DIR=/home/laverta/backups
readonly LOCK_FILE=/home/laverta/deploy.lock
readonly LAST_GOOD_FILE=/home/laverta/.last-good-image
readonly PREVIOUS_GOOD_FILE=/home/laverta/.previous-good-image
readonly GITHUB_KEY=/home/laverta/.ssh/github-readonly
readonly GITHUB_KNOWN_HOSTS=/home/laverta/.ssh/known_hosts
readonly MIN_AVAILABLE_MIB=2048
readonly MIN_DISK_GIB=15

fail() {
  printf 'Laverta deploy stopped: %s\n' "$1" >&2
  exit 1
}

resource_preflight() {
  local now host cores load_1m mem_total_kib mem_available_kib swap_total_kib swap_free_kib
  local disk_kib disk_percent containers restarting memory_ok disk_ok load_ok disk_percent_ok status report

  now=$(date --utc +%Y-%m-%dT%H:%M:%SZ)
  host=$(hostname -s)
  cores=$(getconf _NPROCESSORS_ONLN)
  read -r load_1m _ < /proc/loadavg
  mem_total_kib=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)
  mem_available_kib=$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)
  swap_total_kib=$(awk '/^SwapTotal:/ {print $2}' /proc/meminfo)
  swap_free_kib=$(awk '/^SwapFree:/ {print $2}' /proc/meminfo)
  disk_kib=$(df -Pk / | awk 'NR == 2 {print $4}')
  disk_percent=$(df -Pk / | awk 'NR == 2 {gsub(/%/, "", $5); print $5}')
  containers=$(docker ps -q | wc -l | tr -d ' ')
  restarting=$(docker ps --filter status=restarting -q | wc -l | tr -d ' ')

  memory_ok=$(awk -v available="$mem_available_kib" -v minimum="$MIN_AVAILABLE_MIB" 'BEGIN {print available >= minimum * 1024 ? "true" : "false"}')
  disk_ok=$(awk -v available="$disk_kib" -v minimum="$MIN_DISK_GIB" 'BEGIN {print available >= minimum * 1024 * 1024 ? "true" : "false"}')
  load_ok=$(awk -v one_minute="$load_1m" -v cores="$cores" 'BEGIN {print one_minute <= cores * 1.5 ? "true" : "false"}')
  disk_percent_ok=$(awk -v used="$disk_percent" 'BEGIN {print used < 85 ? "true" : "false"}')

  status=ready
  if [[ "$memory_ok" != true || "$disk_ok" != true || "$load_ok" != true || "$disk_percent_ok" != true ]]; then
    status=blocked
  fi

  report=$(printf '{"timestamp":"%s","host":"%s","cpu_cores":%s,"load_1m":%s,"memory_total_mib":%s,"memory_available_mib":%s,"swap_used_mib":%s,"disk_available_gib":%s,"disk_used_percent":%s,"containers_running":%s,"containers_restarting":%s,"thresholds":{"minimum_memory_mib":%s,"minimum_disk_gib":%s,"maximum_load_per_core":1.5,"maximum_disk_used_percent":85},"status":"%s"}' \
    "$now" "$host" "$cores" "$load_1m" "$((mem_total_kib / 1024))" "$((mem_available_kib / 1024))" "$(((swap_total_kib - swap_free_kib) / 1024))" "$((disk_kib / 1024 / 1024))" "$disk_percent" "$containers" "$restarting" "$MIN_AVAILABLE_MIB" "$MIN_DISK_GIB" "$status")

  printf '%s\n' "$report" | tee "$INVENTORY_DIR/latest.json"
  printf '%s\n' "$report" >> "$INVENTORY_DIR/history.jsonl"
  tail -n 100 "$INVENTORY_DIR/history.jsonl" > "$INVENTORY_DIR/history.jsonl.tmp"
  mv "$INVENTORY_DIR/history.jsonl.tmp" "$INVENTORY_DIR/history.jsonl"

  [[ "$status" == ready ]] || fail "resource preflight blocked deployment (memory, disk, load or disk-use threshold exceeded)"
}

sync_source() {
  [[ -r "$GITHUB_KEY" && -r "$GITHUB_KNOWN_HOSTS" ]] || fail "read-only GitHub deploy key is missing"
  export GIT_SSH_COMMAND="ssh -i ${GITHUB_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=${GITHUB_KNOWN_HOSTS}"

  if [[ ! -d "${APP_ROOT}/.git" ]]; then
    mkdir -p "$(dirname "$APP_ROOT")"
    git clone --quiet --single-branch --branch prototype git@github.com:i-Fandresena/urbix_project.git "$APP_ROOT"
  fi

  [[ -z "$(git -C "$APP_ROOT" status --porcelain)" ]] || fail "the /home/laverta/app checkout has local edits"
  git -C "$APP_ROOT" fetch --quiet --no-tags origin prototype
  [[ "$(git -C "$APP_ROOT" rev-parse FETCH_HEAD)" == "$commit_sha" ]] || fail "prototype advanced; refusing to deploy a stale commit"
  git -C "$APP_ROOT" checkout --quiet --detach "$commit_sha"
}

assert_source_is_current() {
  git -C "$APP_ROOT" fetch --quiet --no-tags origin prototype
  [[ "$(git -C "$APP_ROOT" rev-parse FETCH_HEAD)" == "$commit_sha" ]] || fail "prototype advanced while the image was transferring; refusing to deploy a stale commit"
}

compose() {
  local tag=${COMPOSE_IMAGE_TAG:-$commit_sha}
  IMAGE_TAG="$tag" docker compose --project-directory "$APP_ROOT" --project-name laverta --env-file "$ENV_FILE" --file "$compose_file" "$@"
}

wait_for_postgres() {
  local attempt
  for attempt in $(seq 1 40); do
    if compose exec -T postgres psql -U laverta -d laverta -Atqc 'SELECT 1' >/dev/null 2>&1; then
      return 0
    fi
    sleep 3
  done
  return 1
}

wait_for_app() {
  local tag=$1 attempt container_id state health
  COMPOSE_IMAGE_TAG="$tag"
  export COMPOSE_IMAGE_TAG
  for attempt in $(seq 1 40); do
    container_id=$(compose ps -q app)
    if [[ -n "$container_id" ]]; then
      state=$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)
      health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id" 2>/dev/null || true)
      [[ "$health" == healthy ]] && return 0
      [[ "$state" == exited || "$health" == unhealthy ]] && return 1
    fi
    sleep 3
  done
  return 1
}

rollback_app() {
  local previous_tag=$1
  if [[ -n "$previous_tag" && "$previous_tag" != "$commit_sha" ]] && docker image inspect "laverta:${previous_tag}" >/dev/null 2>&1; then
    printf 'Rolling the app container back to %s\n' "$previous_tag" >&2
    COMPOSE_IMAGE_TAG="$previous_tag" compose up -d --no-build app || true
    if wait_for_app "$previous_tag"; then
      printf 'Previous app image is healthy again. Database backup: %s\n' "$backup_file" >&2
    else
      printf 'Rollback app health check also failed. Database backup: %s\n' "$backup_file" >&2
    fi
  else
    printf 'No previous healthy app image is available. Database backup: %s\n' "$backup_file" >&2
  fi
}

action=${1:-}
if [[ "$action" == inventory && $# -eq 1 ]]; then
  mkdir -p "$INVENTORY_DIR"
  exec 9>"$LOCK_FILE"
  flock -n 9 || fail "another Laverta deployment is already running"
  resource_preflight
  exit 0
fi

[[ "$action" == deploy && $# -eq 2 && "$2" =~ ^[0-9a-f]{40}$ ]] || fail "expected inventory or deploy <40-character commit SHA>"
readonly commit_sha=$2
readonly compose_file="${APP_ROOT}/deploy/compose.production.yaml"
[[ -r "$ENV_FILE" ]] || fail "production environment file /home/laverta/.env is missing"

mkdir -p "$INVENTORY_DIR" "$BACKUP_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || fail "another Laverta deployment is already running"

resource_preflight
sync_source

# Refresh this root-owned entrypoint from the exact checked-out commit. Re-exec
# before consuming the image stream so deploy-script changes take effect on the
# same push; release the lock descriptor before restarting the updated script.
if ! cmp -s "${APP_ROOT}/deploy/server-deploy.sh" /usr/local/sbin/laverta-deploy; then
  install -o root -g root -m 755 "${APP_ROOT}/deploy/server-deploy.sh" /usr/local/sbin/laverta-deploy
  flock -u 9
  exec 9>&-
  exec /usr/local/sbin/laverta-deploy "$@"
fi

gzip -dc | docker load >/dev/null
docker image inspect "laverta:${commit_sha}" >/dev/null 2>&1 || fail "the transferred image does not contain laverta:${commit_sha}"
assert_source_is_current

unset COMPOSE_IMAGE_TAG || true
compose up -d --no-build postgres
wait_for_postgres || fail "PostgreSQL did not become healthy"

backup_file="$BACKUP_DIR/laverta-predeploy-$(date --utc +%Y%m%dT%H%M%SZ)-${commit_sha:0:7}.dump"
compose exec -T postgres pg_dump -U laverta -d laverta --format=custom > "$backup_file"
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'laverta-predeploy-*.dump' -mtime +30 -delete

if ! compose --profile ops run --rm --no-deps migrator; then
  fail "database migrations failed; the running app was left in place; backup: ${backup_file}"
fi

previous_tag=$(cat "$LAST_GOOD_FILE" 2>/dev/null || true)
if ! compose up -d --no-build app; then
  rollback_app "$previous_tag"
  exit 1
fi
if ! wait_for_app "$commit_sha"; then
  printf 'New app image failed its health check: %s\n' "$commit_sha" >&2
  rollback_app "$previous_tag"
  exit 1
fi

if [[ -n "$previous_tag" && "$previous_tag" != "$commit_sha" ]]; then
  printf '%s\n' "$previous_tag" > "$PREVIOUS_GOOD_FILE"
fi
printf '%s\n' "$commit_sha" > "$LAST_GOOD_FILE"

while IFS= read -r tag; do
  [[ "$tag" == "$commit_sha" || "$tag" == "$previous_tag" ]] || docker image rm "laverta:${tag}" >/dev/null 2>&1 || true
done < <(docker image ls --format '{{.Repository}}:{{.Tag}}' | awk -F: '$1 == "laverta" && $2 ~ /^[0-9a-f]{40}$/ {print $2}')

printf 'Laverta deployed and healthy: %s\nDatabase backup: %s\n' "$commit_sha" "$backup_file"
