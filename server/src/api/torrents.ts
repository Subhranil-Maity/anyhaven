import { Elysia } from "elysia";
import * as qbitService from "../services/qbit.js";

export const torrentsRoutes = new Elysia({ prefix: "/api/torrents" })
  .get("/", async () => {
    try {
      const torrents = await qbitService.getTorrents();
      return torrents;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/add", async ({ body }) => {
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
  .post("/:hash/pause", async ({ params }) => {
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
  .post("/:hash/resume", async ({ params }) => {
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
  .delete("/:hash", async ({ params, body }) => {
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
  });
