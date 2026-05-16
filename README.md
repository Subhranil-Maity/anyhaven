# AnyHaven

AnyHaven is a self-hosted anime torrent search + parser service that queries Nyaa RSS feeds and sends selected torrents to qBittorrent.

> This project parses publicly available torrent listing metadata only. It does not host or distribute media content.

## Features

- Search anime torrents via Nyaa RSS
- Fine-grained filtering (resolution, source, codec, episodes, groups, seeders)
- AniList search + details endpoints
- Send magnet/torrent entries to qBittorrent
- View and manage active torrents (pause, resume, delete)

## Monorepo Layout

```text
apps/
  frontend/   # React + Vite UI (port 3333 in dev)
  server/     # Bun + Elysia API (port 3000)
packages/
  shared/     # Shared types used by frontend/server
```

## Requirements

- Bun 1.3+
- qBittorrent with WebUI enabled

## Local Development

Install workspace dependencies once from repo root:

```bash
bun install
```

Run both apps with Turbo:

```bash
bun run dev
```

Or run each app directly:

```bash
bun run --cwd apps/server dev
bun run --cwd apps/frontend dev
```

- Frontend: http://localhost:3333
- Backend API: http://localhost:3000

## Build

```bash
bun run build
```

## Docker

The repository includes a root `Dockerfile` and `docker-compose.yml`.

Build and start:

```bash
docker compose build
docker compose up -d
```

Current compose file mounts `./data` and stores settings at `/data/settings.json` inside the container.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=<query>` | Nyaa RSS search |
| GET, POST | `/api/finesearch` | Fine search parser endpoint |
| GET | `/api/settings` | Get saved qBittorrent settings |
| POST | `/api/settings` | Save qBittorrent settings |
| POST | `/api/settings/test` | Test qBittorrent connection |
| GET | `/api/torrents` | List torrents from qBittorrent |
| POST | `/api/torrents/add` | Add magnet link |
| POST | `/api/torrents/addtorrent` | Add torrent URL |
| POST | `/api/torrents/addfile` | Queue file-level selection from a release |
| POST | `/api/torrents/:hash/pause` | Pause torrent |
| POST | `/api/torrents/:hash/resume` | Resume torrent |
| DELETE | `/api/torrents/:hash` | Delete torrent (`deleteFiles` optional in body) |
| GET | `/api/anilist/search?q=<query>` | AniList search |
| GET | `/api/anilist/getAnimeById/:id` | AniList anime by id |
| GET | `/api/releases/searchById/:id` | Search releases by AniList id |

## Fine Search Parameters

```text
animeTitle           string   (required)
season               number
episode              number
episodeStart         number
episodeEnd           number
isBatch              boolean
preferredResolution  string   (e.g. 1080p, 720p)
preferredSource      string   (e.g. BluRay, WEB)
preferredCodec       string   (e.g. x265, x264)
preferredGroups      string[] or comma-separated string
excludeGroups        string[] or comma-separated string
dualAudio            boolean
minimumSeeders       number
allowMultiSub        boolean
category             string
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONFIG_PATH` | `./.settings.json` (relative to `apps/server` working dir) | Path to qBittorrent settings file |
