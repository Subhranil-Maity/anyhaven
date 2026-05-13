import { Elysia } from "elysia";
import { searchByAniListId } from "../../services/releases.js";

export const releasesSearchByIdRoute = new Elysia({ prefix: "/api/releases" })
  .get("/searchById/:id", async ({ params }) => {
    try {
      const { id } = params as any;

      if (!id) {
        return { error: "Missing required path parameter: id" };
      }

      const results = await searchByAniListId(parseInt(id));

      return results;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
