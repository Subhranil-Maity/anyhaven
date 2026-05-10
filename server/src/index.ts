import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import * as settingsService from "./services/settings.js";
import * as qbitService from "./services/qbit.js";
import * as nyaaService from "./services/nyaa.js";

const app = new Elysia()
  .use(cors())
  // Health
  .get("/api/health", () => ({ ok: true }))
  // Settings
  .get("/api/settings", async () => {
    try {
      const settings = await settingsService.getSettings();
      return settings || { qbitUrl: "", username: "" };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/api/settings", async ({ body }) => {
    try {
      const { qbitUrl, username, password } = body as {
        qbitUrl: string;
        username: string;
        password: string;
      };

      if (!qbitUrl || !username || !password) {
        return { error: "Missing required fields: qbitUrl, username, password" };
      }

      await settingsService.saveSettings({
        qbitUrl,
        username,
        password,
      });

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/api/settings/test", async () => {
    try {
      const success = await qbitService.testConnection();
      return { success };
    } catch (error) {
      return { success: false };
    }
  })
  // Search
  .get("/api/search", async ({ query }) => {
    try {
      const { q, category, filter, user, limit } = query;

      if (!q) {
        return { error: "Missing required query parameter: q" };
      }

      const results = await nyaaService.searchAnime(
        q,
        category,
        filter as "0" | "1" | "2" | undefined,
        user,
        limit ? parseInt(limit) : undefined
      );

      return results;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  // Torrents
  .get("/api/torrents", async () => {
    try {
      const torrents = await qbitService.getTorrents();
      return torrents;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/api/torrents/add", async ({ body }) => {
    try {
      const { magnet } = body as { magnet: string };

      if (!magnet) {
        return { error: "Missing required field: magnet" };
      }

      await qbitService.addMagnet(magnet);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/api/torrents/:hash/pause", async ({ params }) => {
    try {
      const { hash } = params;
      await qbitService.pauseTorrent(hash);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/api/torrents/:hash/resume", async ({ params }) => {
    try {
      const { hash } = params;
      await qbitService.resumeTorrent(hash);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .delete("/api/torrents/:hash", async ({ params, body }) => {
    try {
      const { hash } = params;
      const { deleteFiles } = (body as { deleteFiles?: boolean }) || {};

      await qbitService.deleteTorrent(hash, deleteFiles ?? false);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .listen({
    port: 3000,
    hostname: "0.0.0.0",
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
