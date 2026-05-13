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

export {
    SearchResult
}
