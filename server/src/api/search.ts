import { Elysia } from "elysia";
import * as nyaaService from "../services/nyaa.js";

export const searchRoutes = new Elysia({ prefix: "/api/search" })
  .get("/", async ({ query }) => {
    try {
      const { q, category, filter, user, limit } = query as any;

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
  });
