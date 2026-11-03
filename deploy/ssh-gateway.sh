#!/bin/sh
set -eu

case "${SSH_ORIGINAL_COMMAND:-}" in
  inventory)
    exec /usr/bin/sudo -n /usr/local/sbin/laverta-deploy inventory
    ;;
  deploy:*)
    commit_sha=${SSH_ORIGINAL_COMMAND#deploy:}
    if ! printf '%s' "$commit_sha" | grep -Eq '^[0-9a-f]{40}$'; then
      exit 64
    fi
    exec /usr/bin/sudo -n /usr/local/sbin/laverta-deploy deploy "$commit_sha"
    ;;
  *)
    exit 64
    ;;
esac
