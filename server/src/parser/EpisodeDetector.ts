import { AnitomyResult } from "./types.js";

export class EpisodeDetector {
  static detect(parsed: AnitomyResult) {
    let episode: number | undefined;
    let episodeStart: number | undefined;
    let episodeEnd: number | undefined;

    const epRaw = typeof parsed.episode?.number === 'number' ? parsed.episode.number.toString() : parsed.episode?.number;
    
    if (epRaw) {
      // Check for range like "01-12" or "1~12"
      const rangeMatch = epRaw.match(/^(\d+)\s*[-~]\s*(\d+)$/);
      if (rangeMatch) {
        episodeStart = parseInt(rangeMatch[1], 10);
        episodeEnd = parseInt(rangeMatch[2], 10);
      } else {
        // Handle single episode like "01", "12v2", "EP12"
        const singleMatch = epRaw.match(/^E?P?(\d+)(v\d+)?$/i);
        if (singleMatch) {
          episode = parseInt(singleMatch[1], 10);
        } else {
          // Fallback parsing for single integer
          const parsedInt = parseInt(epRaw, 10);
          if (!isNaN(parsedInt)) {
            episode = parsedInt;
          }
        }
      }
    } else if (typeof parsed.episode?.number === 'number') {
       episode = parsed.episode.number;
    }

    // Validation: prevent years or resolutions from being marked as episodes
    // E.g. if we somehow got 2025 as episode, that's likely a year
    if (episode !== undefined) {
      if (episode > 1900 && episode < 2100) {
         // Might be a year, let's unset it if it matches the parsed year
         if (parsed.year && parseInt(parsed.year, 10) === episode) {
             episode = undefined;
         } else if (parsed.raw && parsed.raw.includes(`(${episode})`)) {
             episode = undefined;
         }
      }
      if ([480, 720, 1080, 2160].includes(episode as number)) {
         if (parsed.raw && parsed.raw.toLowerCase().includes(`${episode}p`)) {
             episode = undefined;
         }
      }
    }

    return {
      episode,
      episodeStart,
      episodeEnd
    };
  }
}
