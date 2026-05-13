interface SearchNyaaResult {
    title: string;
    link: string;
    guid: string;
    category?: string;
    seeders: number;
    leechers: number;
    downloads: number;
    size?: string;
    trusted: boolean;
    remake: boolean;
    publishedAt?: string;
    magnet?: string;
}

export {
    SearchNyaaResult
}
