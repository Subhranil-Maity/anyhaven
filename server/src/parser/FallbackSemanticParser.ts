import * as anitomy from "anitomy";
import { ParseDecision } from "./GroupStrategies.js";

const EPISODE_BLACKLIST = [
  /\b20\d{2}\b/,     // years
  /\b19\d{2}\b/,     // older years
  /\d{3,4}p/,        // resolution
  /\d+mm/,           // film format
  /\d+bit/i,         // codec depth
  /x264|x265|hevc/i, // codec
  /S\d{1,2}/i        // season marker
];

export class FallbackSemanticParser {
  static parseStructuredEpisodeSeason(raw: string): { 
    episode?: ParseDecision<number>; 
    season?: ParseDecision<number>;
  } {
    const match = raw.match(/S(\d{1,2})E(\d{1,3})/i);
    if (match) {
      return {
        season: {
          value: parseInt(match[1], 10),
          confidence: 1.0,
          source: "explicit"
        },
        episode: {
          value: parseInt(match[2], 10),
          confidence: 1.0,
          source: "explicit"
        }
      };
    }
    return {};
  }

  static parseEpisode(raw: string): { 
    episode?: ParseDecision<number>; 
    episodeStart?: ParseDecision<number>; 
    episodeEnd?: ParseDecision<number> 
  } {
    // Check for blacklist tokens and strip them before parsing for episodes
    let sanitized = raw;
    for (const regex of EPISODE_BLACKLIST) {
      sanitized = sanitized.replace(regex, "");
    }

    // 1. Explicit markers (Highest confidence)
    const explicitMatch = sanitized.match(/\b(EP|E|Episode|Ep)\s*(\d{1,3})\b/i);
    if (explicitMatch) {
      return {
        episode: {
          value: parseInt(explicitMatch[2], 10),
          confidence: 0.95,
          source: "explicit"
        }
      };
    }

    // 2. Range formats
    const rangeMatch = sanitized.match(/\b(\d{1,3})\s*-\s*(\d{1,3})\b/) || sanitized.match(/\bEP(\d{1,3})-EP(\d{1,3})\b/i);
    if (rangeMatch) {
      return {
        episodeStart: {
          value: parseInt(rangeMatch[1], 10),
          confidence: 0.95,
          source: "explicit"
        },
        episodeEnd: {
          value: parseInt(rangeMatch[2], 10),
          confidence: 0.95,
          source: "explicit"
        }
      };
    }

    // 3. Isolated numeric episode (Safe context only)
    // Looking for a number surrounded by separators
    const isolatedMatch = sanitized.match(/(?:-\s+|\s+)0*(\d{1,3})(?:\s+v\d|\s*\[|\s*\()/);
    if (isolatedMatch) {
      return {
        episode: {
          value: parseInt(isolatedMatch[1], 10),
          confidence: 0.75,
          source: "inferred"
        }
      };
    }

    return {};
  }

  static parseSeason(raw: string, parsed: any): ParseDecision<number> | undefined {
    // 1. Explicit season tag (HIGHEST PRIORITY)
    const explicit = raw.match(/\b(Season\s*\d+|S\d{1,2})\b/i);
    if (explicit) {
      const numMatch = explicit[1].match(/\d+/);
      if (numMatch) {
        return {
          value: parseInt(numMatch[0], 10),
          confidence: 1.0,
          source: "explicit"
        };
      }
    }

    // 2. Parenthetical season
    const paren = raw.match(/\((Season\s*\d+|S\d{1,2})\)/i);
    if (paren) {
      const numMatch = paren[1].match(/\d+/);
      if (numMatch) {
        return {
          value: parseInt(numMatch[0], 10),
          confidence: 0.95,
          source: "explicit"
        };
      }
    }

    // 3. Text-based season
    const textSeason = raw.match(/\b(\d+)(st|nd|rd|th)\s*Season\b/i);
    if (textSeason) {
      return {
        value: parseInt(textSeason[1], 10),
        confidence: 0.85,
        source: "inferred"
      };
    }

    // Anitomy fallback
    if (parsed.season) {
       return {
         value: parseInt(parsed.season, 10),
         confidence: 0.5,
         source: "fallback"
       };
    }

    return undefined;
  }

  static parseBatch(raw: string): ParseDecision<boolean> {
    const batchRegex = /\b(Batch|Complete|Season Pack|01-12|Full Season|Collection)\b/i;
    if (batchRegex.test(raw)) {
      return {
        value: true,
        confidence: 0.95,
        source: "explicit"
      };
    }
    return {
      value: false,
      confidence: 0.5,
      source: "fallback"
    };
  }

  static parseTitles(raw: string): { englishTitle: string; alternativeTitle?: string } {
    // [Group] English Title (Alt Title) - S01E01 ...
    // First remove the group if present
    const cleanRaw = raw.replace(/^\[.*?\]\s*/, "");
    
    // Look for Title (Alt Title) before the episode marker or metadata brackets
    // Witch Hat Atelier (Tongari Boushi no Atelier) - S01E03
    const titleSection = cleanRaw.split(/\s*-\s*S\d+|\[|\(/)[0].trim();
    
    // Try to find parentheses after the main title
    const parenMatch = cleanRaw.match(/^(.*?)\s*\((.*?)\)/);
    if (parenMatch) {
      return {
        englishTitle: parenMatch[1].trim(),
        alternativeTitle: parenMatch[2].trim()
      };
    }

    return {
      englishTitle: titleSection
    };
  }

  static parseBracketMetadata(raw: string) {
    const results: {
      resolution?: string;
      codec?: string;
      audio?: "dual" | "single";
      subtitles?: "multi" | "single";
    } = {};

    const bracketMatches = raw.matchAll(/\[(.*?)\]/g);
    for (const match of bracketMatches) {
      const tag = match[1].toLowerCase();
      if (tag.includes("1080p") || tag.includes("720p") || tag.includes("2160p") || tag.includes("4k")) {
        results.resolution = match[1];
      } else if (tag.includes("hevc") || tag.includes("x265") || tag.includes("x264") || tag.includes("av1")) {
        results.codec = match[1];
      } else if (tag.includes("dual-audio") || tag.includes("dual audio")) {
        results.audio = "dual";
      } else if (tag.includes("multi-subs") || tag.includes("multi-sub") || tag.includes("multi subs")) {
        results.subtitles = "multi";
      }
    }

    return results;
  }

  static parseReleaseType(raw: string): "weekly" | "batch" | "unknown" {
    const lower = raw.toLowerCase();
    if (lower.includes("(weekly)")) return "weekly";
    if (lower.includes("batch") || lower.includes("complete") || lower.includes("collection")) return "batch";
    return "unknown";
  }
}
