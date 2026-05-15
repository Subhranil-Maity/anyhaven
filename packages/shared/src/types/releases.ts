interface ReleasesSearchResult {
    dualAudio: boolean,
    isBest: boolean,
    releaseGroup: string,
    url: string,
    /** The torrent's info hash (hex string), used for fast lookup in qBittorrent */
    infoHash?: string,
    files: {
        length: number,
        name: string
    }[],
}


export {
    ReleasesSearchResult 
}
