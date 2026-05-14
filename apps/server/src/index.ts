import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysia/static';
import { settingsRoutes } from './api/settings.js';
import { searchRoutes } from './api/search.js';
import { fineSearchRoutes } from './api/finesearch.js';
import { torrentsRoutes } from './api/torrents.js';
import { anilistSearchRoute } from './api/anilist/search.js';
import { anilistGetAnimeByIdRoute } from './api/anilist/getAnimeById.js';
import { releasesSearchByIdRoute } from './api/releases/searchById.js';

const app = new Elysia()
  .use(cors())
  // Health
  .get("/api/health", () => ({ ok: true }))
  .use(settingsRoutes)
  .use(searchRoutes)
  .use(fineSearchRoutes)
  .use(torrentsRoutes)
  .use(anilistSearchRoute)
  .use(anilistGetAnimeByIdRoute)
  .use(releasesSearchByIdRoute);
if (process.env.NODE_ENV === "development") {
  app.use(
    staticPlugin({
      assets: "../frontend/dist/",
      prefix: "/",
      alwaysStatic: true
    })
  )
    .get("/*", () => Bun.file("../frontend/dist/index.html"));
}

app.listen({
  port: 3000,
  hostname: "0.0.0.0",
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
