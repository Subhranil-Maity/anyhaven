export type ParseDecision<T> = {
  value: T | null;
  confidence: number;
  source: "explicit" | "inferred" | "metadata" | "fallback" | "group";
};

export type GroupStrategyResult = {
  episode?: ParseDecision<number>;
  episodeStart?: ParseDecision<number>;
  episodeEnd?: ParseDecision<number>;
  isBatch?: ParseDecision<boolean>;
};

export interface GroupStrategy {
  name: string;
  apply(raw: string): GroupStrategyResult;
}

export const GroupStrategies: Record<string, GroupStrategy> = {
  "subsplease": {
    name: "subsplease",
    apply: (raw: string) => {
      const result: GroupStrategyResult = {};
      
      // Episode pattern: "- 12"
      const epMatch = raw.match(/-\s+(\d{1,3})(v\d)?\s*\(/);
      if (epMatch) {
        result.episode = {
          value: parseInt(epMatch[1], 10),
          confidence: 1.0,
          source: "group"
        };
      }

      // Batch
      if (raw.toLowerCase().includes("batch")) {
        result.isBatch = {
          value: true,
          confidence: 1.0,
          source: "group"
        };
      }

      return result;
    }
  },
  "erai-raws": {
    name: "erai-raws",
    apply: (raw: string) => {
      const result: GroupStrategyResult = {};
      
      const epMatch = raw.match(/-\s+(\d{1,3})(v\d)?\s*\[/);
      if (epMatch) {
        result.episode = {
          value: parseInt(epMatch[1], 10),
          confidence: 1.0,
          source: "group"
        };
      } else {
        const altEpMatch = raw.match(/EP\s*(\d{1,3})/i);
        if (altEpMatch) {
          result.episode = {
             value: parseInt(altEpMatch[1], 10),
             confidence: 0.9,
             source: "group"
          }
        }
      }

      const lower = raw.toLowerCase();
      if (lower.includes("batch") || lower.includes("complete") || lower.includes("pack")) {
        result.isBatch = {
          value: true,
          confidence: 1.0,
          source: "group"
        };
      }

      return result;
    }
  },
  "ember": {
    name: "ember",
    apply: (raw: string) => {
      const result: GroupStrategyResult = {};
      
      // Explicit episode only
      const explicitEp = raw.match(/\b(EP|E|-)\s*(\d{1,3})\b/i);
      if (explicitEp) {
        result.episode = {
          value: parseInt(explicitEp[2], 10),
          confidence: 0.95,
          source: "group"
        };
      }

      const lower = raw.toLowerCase();
      if (lower.includes("batch") || lower.includes("complete")) {
        result.isBatch = {
          value: true,
          confidence: 1.0,
          source: "group"
        };
      }

      return result;
    }
  },
  "judas": {
    name: "judas",
    apply: (raw: string) => {
      const result: GroupStrategyResult = {};
      
      // Range first
      const rangeMatch = raw.match(/(?:Batch|)\s*(\d{1,3})\s*[-~]\s*(\d{1,3})/i);
      if (rangeMatch) {
        result.episodeStart = {
          value: parseInt(rangeMatch[1], 10),
          confidence: 1.0,
          source: "group"
        };
        result.episodeEnd = {
          value: parseInt(rangeMatch[2], 10),
          confidence: 1.0,
          source: "group"
        };
      }

      result.isBatch = {
        value: true,
        confidence: 1.0, // Judas is almost always batch oriented
        source: "group"
      };

      return result;
    }
  }
};
