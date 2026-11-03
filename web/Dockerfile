FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run lint && npm run build

FROM node:22-bookworm-slim AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NODE_OPTIONS=--max-old-space-size=512

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --create-home nextjs

COPY --from=production-dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

# Keep the pinned Better Auth CLI and migration inputs available to the one-shot migrator.
COPY --from=build --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=build --chown=nextjs:nodejs /app/src/lib/auth.ts ./src/lib/auth.ts
COPY --from=build --chown=nextjs:nodejs /app/src/lib/auth-config.ts ./src/lib/auth-config.ts
COPY --from=build --chown=nextjs:nodejs /app/src/lib/db.ts ./src/lib/db.ts
COPY --from=build --chown=nextjs:nodejs /app/db ./db
COPY --from=build --chown=nextjs:nodejs /app/scripts/migrate-reports.mjs ./scripts/migrate-reports.mjs
COPY --from=build --chown=nextjs:nodejs /app/scripts/migrate-signalements.mjs ./scripts/migrate-signalements.mjs

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
