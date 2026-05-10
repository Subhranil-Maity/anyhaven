// npm i fast-xml-parser
// Uses native fetch in Node 18+

import { XMLParser } from "fast-xml-parser";

export enum NyaaCategory {
  AllCategories = "0_0",
  Anime = "1_0",
  AnimeEnglishTranslated = "1_2",
  AnimeRaw = "1_4",
  Audio = "2_0",
  Literature = "3_0",
}

export interface NyaaItem {
  title: string;
  link: string;
  guid: string;
  category?: string;
  seeders?: number;
  leechers?: number;
  downloads?: number;
  size?: string;
  trusted?: boolean;
  remake?: boolean;
  pubDate?: string;
}

export interface NyaaSearchOptions {
  query: string;
  category?: NyaaCategory | string; // preset enum or custom category code
  filter?: "0" | "1" | "2"; // 0=no filter,1=no remake,2=trusted only
  user?: string;
  limit?: number;
}

export class NyaaRSS {
  private readonly baseUrl = "https://nyaa.si";

  async search(opts: NyaaSearchOptions): Promise<NyaaItem[]> {
    const params = new URLSearchParams({
      page: "rss",
      q: opts.query,
      c: opts.category ?? NyaaCategory.AllCategories,
      f: opts.filter ?? "0",
    });

    if (opts.user) {
      params.set("u", opts.user);
    }

    const url = `${this.baseUrl}/?${params.toString()}`;
    console.log(url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "nyaa-rss-parser/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Nyaa request failed: ${res.status}`);
    }

    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];

    return items.slice(0, opts.limit ?? 50).map((item: any) => ({
      title: item.title,
      link: item.link,
      guid: item.guid,
      category: item.category,
      size: item["nyaa:size"],
      seeders: Number(item["nyaa:seeders"] ?? 0),
      leechers: Number(item["nyaa:leechers"] ?? 0),
      downloads: Number(item["nyaa:downloads"] ?? 0),
      trusted: item["nyaa:trusted"] === "Yes",
      remake: item["nyaa:remake"] === "Yes",
      pubDate: item.pubDate,
    }));
  }
}
