# -------------------------
# Stage 1: Frontend build
# -------------------------
FROM oven/bun:1 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lock ./
RUN bun install

COPY frontend/ ./
RUN bun run build


# -------------------------
# Stage 2: Backend deps
# -------------------------
FROM oven/bun:1 AS backend-deps

WORKDIR /app/server

COPY server/package.json server/bun.lock ./
RUN bun install --frozen-lockfile


# -------------------------
# Stage 3: Runtime
# -------------------------
FROM oven/bun:1

WORKDIR /app

# frontend build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# backend code + deps
COPY server/ ./server/
COPY --from=backend-deps /app/server/node_modules ./server/node_modules

WORKDIR /app/server

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]