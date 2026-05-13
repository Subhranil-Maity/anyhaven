import { SearchNyaaResult } from "@repo/shared/types/nyaa";
import { NyaaRSS, NyaaItem } from "../../nyaa/index.js";



export async function searchAnime(
  query: string,
  category?: string | undefined,
  filter?: "0" | "1" | "2",
  user?: string,
  limit?: number
): Promise<SearchNyaaResult[]> {
  const nyaa = new NyaaRSS();

  const items = await nyaa.search({
    query,
    category,
    filter,
    user,
    limit,
  });

  return items.map((item: NyaaItem) => ({
    title: item.title,
    link: item.link,
    guid: item.guid,
    category: item.category,
    seeders: item.seeders ?? 0,
    leechers: item.leechers ?? 0,
    downloads: item.downloads ?? 0,
    size: item.size,
    trusted: item.trusted ?? false,
    remake: item.remake ?? false,
    publishedAt: item.pubDate,
    magnet: extractMagnetFromLink(item.link),
  }));
}

function extractMagnetFromLink(link: string): string | undefined {
  // Most torrents from Nyaa have a download link, we'll extract magnet if available
  // For now, return undefined as Nyaa RSS typically provides torrent file links
  // Frontend can convert torrent links to magnet using a library
  return undefined;
}
