import { Anime } from "@repo/shared/types/anilist";
import { Graffle } from "graffle";
// TODO: Add cache for the anilist data
const client = Graffle
    .create()
    .transport({
        url: "https://graphql.anilist.co",
    });



async function searchAnime(search: string, page: number = 1, perPage: number = 10): Promise<Anime[] | null> {
    const data = await client.gql(`
        query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME) {
          id
          episodes
          description(asHtml: false)
          bannerImage
          genres
          averageScore
          status

          title {
            romaji
            english
            native
          }

          coverImage {
            large
            extraLarge
          }
        }
    }
      }
  `).$send({ search, page, perPage });
    return (data?.Page?.media as unknown as Anime[]) || null;
}
async function getAnimeById(id: number): Promise<Anime | null> {
    const data = await client
        .gql(`
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          episodes
          description(asHtml: false)
          bannerImage
          genres
          averageScore
          status

          title {
            romaji
            english
            native
          }

          coverImage {
            large
            extraLarge
          }
        }
      }
    `)
        .$send({
            id
        });

    return (data?.Media as unknown as Anime) ?? null;
}

export {
    searchAnime,
    getAnimeById,
};