

interface ReleasesSearchByIdIteam {
    alID: number,
    collectionId: string,
    collectionName: string,
    comparison: string,
    created: string,
    id: string,
    incomplete: boolean,
    notes: string,
    theoreticalBest: string,
    trs: string[],
    updated: string,
    expand: { trs: TrItem[] }
}

interface TrItem {
    collectionId: string,
    collectionName: string,
    created: string,
    dualAudio: boolean,
    files: RFile[],
    groupedUrl: string,
    id: string,
    infoHash: string,
    isBest: boolean,
    releaseGroup: string,
    tags: string[],
    tracker: string,
    updated: string,
    url: string,
}

interface RFile {
    name: string,
    length: number
}

interface ReleasesSearchByIdResult {
    page: number,
    perPage: number,
    totalItems: number,
    totalPages: number,
    items: ReleasesSearchByIdIteam[]
}

interface SearchResult {
    dualAudio: boolean,
    isBest: boolean,
    releaseGroup: string,
    url: string,
    files: {
        length: number,
        name: string
    }[],
}

async function searchByAniListId(id: number): Promise<SearchResult[]> {
    const result = await fetch(`https://releases.moe/api/collections/entries/records?filter=alID=${id}&expand=trs`)
    if (!result.ok) {
        return []
    }
    const data = await result.json() as ReleasesSearchByIdResult
    const nyaaTrs = data.items[0].expand.trs.filter(i => i.tracker.toLowerCase().includes('nyaa')).map(i => {
        return {
            dualAudio: i.dualAudio,
            isBest: i.isBest,
            releaseGroup: i.releaseGroup,
            url: i.url,
            files: i.files
        }
    })
    return nyaaTrs
}

function getTorrentFile(res: SearchResult): String {
    const base = res.url.trim()
    return base.replace("nyaa.si/view/", "nyaa.si/download/") + ".torrent"
}
export { searchByAniListId, getTorrentFile, SearchResult }