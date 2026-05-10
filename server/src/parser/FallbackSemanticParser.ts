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
}
