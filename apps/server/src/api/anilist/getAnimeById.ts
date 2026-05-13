import { Elysia } from "elysia";
import { getAnimeById } from "../../services/anilist.js";

export const anilistGetAnimeByIdRoute = new Elysia({ prefix: "/api/anilist/getAnimeById" })
  .get("/:id", async ({ params }) => {
    try {
      const { id } = params as any;

      if (!id) {
        return { error: "Missing required path parameter: id" };
      }

      const results = await getAnimeById(parseInt(id));

      if (!results) {
        return { error: "Anime not found" };
      }

      return results;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
