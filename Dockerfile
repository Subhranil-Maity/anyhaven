FROM oven/bun:1 AS deps

WORKDIR /app

# Install workspace dependencies first for better layer caching.
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

FROM deps AS build

WORKDIR /app
COPY . .
RUN bun run --cwd apps/frontend build
RUN bun run --cwd apps/server build

FROM oven/bun:1-slim AS runtime

WORKDIR /app/apps/server

# Server enables static frontend serving when NODE_ENV=development.
ENV NODE_ENV=development

# Keep runtime image minimal: only built artifacts, no node_modules.
COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/apps/frontend/dist ../frontend/dist

EXPOSE 3000

CMD ["bun", "dist/index.js"]
