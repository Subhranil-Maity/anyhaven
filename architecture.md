
# Architecture.md

# Anime Torrent Helper Architecture

A lightweight self-hosted web app for:
- searching anime torrents from Nyaa RSS/search
- viewing available releases
- sending downloads to qBittorrent
- monitoring torrent progress

This project is intentionally simple.
It is designed primarily for personal use.

---

# Goals

- Simple architecture
- Single deployment
- Easy Docker support
- Low maintenance
- No microservices
- No cloud dependencies
- Minimal database complexity

---

# Core Stack

## Frontend
- React
- Vite
- TailwindCSS

Purpose:
- UI
- search page
- torrent list
- settings page

---

## Backend
- Bun
- Elysia (or Hono)

Purpose:
- API server
- qBittorrent integration
- RSS fetching/parsing
- background workers
- websocket updates

---

## Storage

Initially:
- SQLite using `bun:sqlite`

Why:
- single file database
- no setup
- more reliable than JSON
- easy Docker persistence

DB file example:

```text
/data/app.db
````

---

# High-Level Architecture

```text
Browser UI (React)
        │
        ▼
Bun Backend Server
├── API routes
├── qBit client
├── RSS parser
├── workers
├── websocket server
└── SQLite storage
        │
        ▼
qBittorrent WebUI API
```

Single app.
Single backend process.
Single Docker container.

---

# Why Backend Exists

The backend handles:

* qBit credentials
* RSS fetching
* torrent submission
* background polling
* persistent storage

The browser should never directly talk to qBittorrent.

---

# Main Features

## Search Anime

Flow:

```text
User searches anime
    ↓
Backend queries Nyaa RSS/search
    ↓
Parse XML/results
    ↓
Return normalized JSON
    ↓
Frontend displays releases
```

Displayed info:

* title
* size
* seeders
* leechers
* upload date

---

## Download Torrent

Flow:

```text
User clicks download
    ↓
Frontend POSTs to backend
    ↓
Backend sends magnet/torrent to qBit
    ↓
Backend stores history
```

---

## Torrent Monitoring

Backend periodically polls qBit:

```text
Every 5 seconds:
- fetch torrent states
- update cache/database
- broadcast websocket updates
```

Frontend receives live updates.

---

# Workers

Workers are simple background loops.

Not separate services.

Example workers:

* torrent sync worker
* RSS refresh worker
* cleanup worker

Example:

```ts
setInterval(async () => {
  await syncTorrents()
}, 5000)
```

Workers run inside the main Bun app.

---

# Suggested Folder Structure

```text
apps/
  web/
    src/
      pages/
      components/
      hooks/
      lib/

  server/
    src/
      routes/
      services/
      workers/
      db/
      utils/

packages/
  shared/
```

Can be simplified further if needed.

---

# Backend Modules

## qBit Service

Responsible for:

* authentication
* adding magnets
* listing torrents
* pause/resume/delete

Example:

```ts
class QBittorrentClient {
  login()
  addMagnet()
  getTorrents()
}
```

---

## RSS Service

Responsible for:

* querying Nyaa
* parsing RSS/XML
* normalizing results

---

## Torrent Worker

Responsible for:

* polling qBit
* caching torrent states
* websocket broadcasting

---

# API Design

## Search

```http
GET /api/search?q=one-piece
```

Returns:

```json
[
  {
    "title": "...",
    "seeders": 100,
    "leechers": 5,
    "magnet": "..."
  }
]
```

---

## Add Torrent

```http
POST /api/torrents/add
```

Body:

```json
{
  "magnet": "..."
}
```

---

## Torrent List

```http
GET /api/torrents
```

---

# WebSocket

Used for:

* live torrent progress
* speeds
* status updates

Optional initially.
Can begin with polling.

---

# Docker Philosophy

Docker support should exist early.

But development should remain simple.

---

# Development Workflow

## Local Development

Run directly:

```bash
bun dev
```

Fast iteration and hot reload.

---

## Docker Validation

Occasionally test:

```bash
docker compose up --build
```

Ensures:

* networking works
* persistence works
* paths work
* deployment works

---

# Docker Compose Example

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data

  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent
    ports:
      - "8080:8080"
```

---

# Persistence

SQLite database and app files should persist through Docker volumes.

Example:

```text
./data
```

Contains:

* SQLite DB
* cache
* settings

---

# Authentication

Initially:

* no auth
* local/self-hosted only

Possible future:

* simple password login

---

# Future Features (Optional)

## Watchlists

Auto-monitor anime releases.

---

## Auto Download Rules

Example:

```text
If SubsPlease uploads episode 5,
download automatically.
```

---

## Notifications

* Discord webhook
* Telegram notifications

---

## Better Search

Move from RSS scraping to:

* Nyaa HTML scraping
* Prowlarr integration

---

# Non-Goals

Not trying to become:

* Sonarr replacement
* enterprise app
* distributed system

Keep architecture simple.

---

# Design Principles

* monolith over microservices
* SQLite over heavy DBs
* simple workers over queues
* Docker-friendly
* minimal dependencies
* personal-use focused

---

# Final Summary

This app is:

```text
React frontend
+
Bun backend
+
background workers
+
SQLite
+
qBittorrent integration
```

all running together as a single application.
