import { Elysia } from "elysia";
import { FineSearchEngine, FineSearchQuery } from "../parser/index.js";

const handleFineSearch = async ({ query, body }: any) => {
  try {
    const input = Object.keys(query || {}).length > 0 ? query : (body || {});

    const searchReq: FineSearchQuery = {
      animeTitle: input.animeTitle,
      season: input.season ? parseInt(input.season) : undefined,
      episode: input.episode ? parseInt(input.episode) : undefined,
      episodeStart: input.episodeStart ? parseInt(input.episodeStart) : undefined,
      episodeEnd: input.episodeEnd ? parseInt(input.episodeEnd) : undefined,
      isBatch: input.isBatch === "true" || input.isBatch === true,
      preferredResolution: input.preferredResolution,
      preferredSource: input.preferredSource,
      preferredCodec: input.preferredCodec,
      dualAudio: input.dualAudio === "true" || input.dualAudio === true,
      minimumSeeders: input.minimumSeeders ? parseInt(input.minimumSeeders) : undefined,
      allowMultiSub: input.allowMultiSub === "true" || input.allowMultiSub === true,
      category: input.category,
    };

    if (input.preferredGroups) {
      searchReq.preferredGroups = Array.isArray(input.preferredGroups)
        ? input.preferredGroups
        : input.preferredGroups.split(',').map((s: string) => s.trim());
    }

    if (input.excludeGroups) {
      searchReq.excludeGroups = Array.isArray(input.excludeGroups)
        ? input.excludeGroups
        : input.excludeGroups.split(',').map((s: string) => s.trim());
    }

    if (!searchReq.animeTitle) {
      return { error: "Missing required field: animeTitle" };
    }

    const results = await FineSearchEngine.search(searchReq);
    return results;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const fineSearchRoutes = new Elysia({ prefix: "/api/finesearch" })
  .get("/", handleFineSearch)
  .post("/", handleFineSearch);
