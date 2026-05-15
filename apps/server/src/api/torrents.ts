import { Elysia } from "elysia";
import * as qbitService from "../services/qbit.js";

const torrentsRoutes = new Elysia({ prefix: "/api/torrents" });
torrentsRoutes.get("/", async () => {
  try {
    const torrents = await qbitService.getTorrents();
    return torrents;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
torrentsRoutes.post("/add", async ({ body }) => {
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
});
torrentsRoutes.post("/addtorrent", async ({ body }) => {
  try {
    const { torrenturl } = body as { torrenturl: string };

    if (!torrenturl) {
      return { error: "Missing required field: torrenturl" };
    }

    await qbitService.addTorrent(torrenturl);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

torrentsRoutes.post("/addfile", async ({ body, set }) => {
  const { torrentUrl, fileName, releaseFiles, infoHash } = body as {
    torrentUrl: string;
    fileName: string;
    releaseFiles?: string[];
    infoHash?: string;
  };

  if (!torrentUrl || !fileName) {
    set.status = 400;
    return { error: "Missing required fields: torrentUrl, fileName" };
  }

  // Respond immediately so the browser doesn't time out.
  // The actual work (which may take up to 30s polling qBit) runs in the background.
  set.status = 202;
  qbitService
    .addTorrentWithFileSelection(torrentUrl, fileName, releaseFiles ?? [], infoHash)
    .catch((err) =>
      console.error("[addfile] background task failed:", err)
    );

  return { accepted: true, message: "File queued for selection" };
});



torrentsRoutes.post("/:hash/pause", async ({ params }) => {
  try {
    const { hash } = params;
    await qbitService.pauseTorrent(hash);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
torrentsRoutes.post("/:hash/resume", async ({ params }) => {
  try {
    const { hash } = params;
    await qbitService.resumeTorrent(hash);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
torrentsRoutes.delete("/:hash", async ({ params, body }) => {
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

export { torrentsRoutes };