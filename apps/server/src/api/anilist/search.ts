import { Elysia } from "elysia";
import { searchAnime } from "../../services/anilist.js";

export const anilistSearchRoute = new Elysia({ prefix: "/api/anilist/search" })
  .get("/", async ({ query }) => {
    try {
      const { q, page, perPage } = query as any;

      if (!q) {
        return { error: "Missing required query parameter: q" };
      }

      const results = await searchAnime(
        q,
        page ? parseInt(page) : undefined,
        perPage ? parseInt(perPage) : undefined
      );

      return results;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
