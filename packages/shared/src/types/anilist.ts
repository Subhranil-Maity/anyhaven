interface Anime {
    id: number;
    episodes?: number | null;
    description?: string | null;
    bannerImage?: string | null;

    title: {
        romaji: string;
        english?: string | null;
        native?: string | null;
    };

    coverImage: {
        large?: string | null;
        extraLarge?: string | null;
    };

    genres?: string[];

    averageScore?: number | null;
    status?: string | null;
};

export { Anime };