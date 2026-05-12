# AnyHaven

A self-hosted anime torrent parser that searches Nyaa RSS feeds and sends magnets to qBittorrent.
> This tool is a parsing and indexing utility for publicly available torrent listing metadata. It does not host, store, distribute, or link to any copyrighted content. All processed data is limited to publicly accessible information used solely for search, categorization, and display purposes.
---

## Features

- Search anime torrents via Nyaa RSS
- Fine-grained filtering (resolution, codec, source, season/episode, groups, seeders)
- Add torrents directly to qBittorrent
- Monitor and manage active downloads (pause/resume/delete)
- Minimal UI for personal use

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TailwindCSS 4, Radix UI |
| Backend | Bun, Elysia |
| Parser | fast-xml-parser, anitomy |
| Downloads | qBittorrent WebUI API |

---

## Quick Start (Development)

```bash
# Backend
cd server && bun install && bun run dev

# Frontend (separate terminal)
cd frontend && bun install && bun run dev
```

- Frontend: http://localhost:3333
- Backend API: http://localhost:3000

---

## Docker / Production

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A running qBittorrent instance with WebUI enabled


### Build and run

```bash
docker compose build 
```
### Docker Compose 
```yaml
services:
  anyhaven:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./config/anyhaven:/config
    environment:
      - CONFIG_PATH=/config/settings.json
    network_mode: host
```
> Note: Use `network_mode: host` if u wnat to connect to qbittorent container running in another docker network. if possible put it under same network as you qbittorent. If u have any better idea then feel free to contibute.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=<query>` | Nyaa RSS search |
| GET,POST | `/api/finesearch` | Advanced filtering search |
| GET | `/api/settings` | Get qBit settings |
| POST | `/api/settings` | Save qBit settings |
| POST | `/api/settings/test` | Test qBit connection |
| GET | `/api/torrents` | List active torrents |
| POST | `/api/torrents/add` | Add magnet link |
| POST | `/api/torrents/:hash/pause` | Pause torrent |
| POST | `/api/torrents/:hash/resume` | Resume torrent |
| DELETE | `/api/torrents/:hash` | Delete torrent |

### Fine Search Parameters

```
animeTitle      string   (required) - Title to search
season          number   - Match specific season
episode         number   - Match specific episode number
episodeStart    number   - Range start
episodeEnd      number   - Range end
isBatch         boolean  - Prefer batch releases
preferredResolution  string - e.g. "1080p", "720p"
preferredSource  string  - e.g. "BluRay", "WEB"
preferredCodec   string  - e.g. "x265", "x264"
preferredGroups  string[] - Trust these release groups
excludeGroups   string[] - Exclude these groups
dualAudio       boolean  - Prefer dual audio releases
minimumSeeders  number   - Minimum seeder count
allowMultiSub   boolean  - Allow multi-sub releases
category        string  - Nyaa category filter
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONFIG_PATH` | `./.settings.json` | Path to settings file |
