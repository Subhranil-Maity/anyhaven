import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { anilistSearchByName } from "@/services/anilist";
import type { Anime } from "@repo/shared/types/anilist";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const temp: Anime = {
    "id": 21,
    "episodes": null,
    "description": "Gold Roger was known as the Pirate King, the strongest and most infamous being to have sailed the Grand Line. The capture and death of Roger by the World Government brought a change throughout the world. His last words before his death revealed the location of the greatest treasure in the world, One Piece. It was this revelation that brought about the Grand Age of Pirates, men who dreamed of finding One Piece (which promises an unlimited amount of riches and fame), and quite possibly the most coveted of titles for the person who found it, the title of the Pirate King.<br><br>\nEnter Monkey D. Luffy, a 17-year-old boy that defies your standard definition of a pirate. Rather than the popular persona of a wicked, hardened, toothless pirate who ransacks villages for fun, Luffy’s reason for being a pirate is one of pure wonder; the thought of an exciting adventure and meeting new and intriguing people, along with finding One Piece, are his reasons of becoming a pirate. Following in the footsteps of his childhood hero, Luffy and his crew travel across the Grand Line, experiencing crazy adventures, unveiling dark mysteries and battling strong enemies, all in order to reach One Piece.<br><br>\n<b>*This includes following special episodes:</b><br>\n- Chopperman to the Rescue! Protect the TV Station by the Shore! (Episode 336)<br>\n- The Strongest Tag-Team! Luffy and Toriko's Hard Struggle! (Episode 492)<br>\n- Team Formation! Save Chopper (Episode 542)<br>\n- History's Strongest Collaboration vs. Glutton of the Sea (Episode 590)<br>\n- 20th Anniversary! Special Romance Dawn (Episode 907)",
    "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg",
    "genres": [
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy"
    ],
    "averageScore": 87,
    "status": "RELEASING",
    "title": {
        "romaji": "ONE PIECE",
        "english": "ONE PIECE",
        "native": "ONE PIECE"
    },
    "coverImage": {
        "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
        "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg"
    }
}

function AnimeCard({ anime, index }: { anime: Anime; index: number }) {
    // Strip HTML tags and truncate description
    const cleanDescription = anime.description?.replace(/<[^>]*>?/gm, '') || '';
    const slicedDescription = cleanDescription.length > 220
        ? cleanDescription.substring(0, 220) + '...'
        : cleanDescription;
    const navigate = useNavigate();
    const handleAnimeClick = () => {
        navigate(`/details/${anime.id}`);
    }

    return (
        <div
            className="group relative flex flex-col sm:flex-row glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-cyan hover:border-primary/50 hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={handleAnimeClick}
        >
            {/* Left Color Bar Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-secondary opacity-50 group-hover:opacity-100" />

            <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={anime.coverImage.large}
                    alt={anime.title.romaji}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {anime.averageScore && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-primary border border-primary/30">
                        <Star className="h-3 w-3 fill-primary" />
                        {anime.averageScore}%
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2 gap-4">
                        <div>
                            <h3 className="text-xl md:text-2xl font-syne font-bold text-white group-hover:text-primary transition-colors leading-tight line-clamp-1">
                                {anime.title.romaji}
                            </h3>
                            <h4 className="text-sm text-muted-foreground/80">{anime.title.english || anime.title.native || ""}</h4>
                        </div>
                        {anime.status && (
                            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-widest border-primary/20 text-primary whitespace-nowrap">
                                {anime.status}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-4 font-inter leading-relaxed">
                        {slicedDescription}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {anime.genres?.slice(0, 5).map((genre) => (
                            <Badge key={genre} variant="secondary" className="bg-white/5 hover:bg-primary/20 text-[10px] px-2 py-0 border-white/5 transition-colors">
                                {genre}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-primary hover:text-black transition-all group/btn">
                        <span className="text-xs font-bold uppercase tracking-wider">Details</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function SearchPage() {
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearchInput = useDebounce(searchInput, 500);
    const searchQuery = useQuery({
        queryKey: ["userSearchInput", debouncedSearchInput],
        queryFn: async () => await anilistSearchByName(debouncedSearchInput),
        enabled: debouncedSearchInput.length > 5
    });
    const handleSearch = () => {
        searchQuery.refetch();
    }
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                    <Input
                        className="h-14 w-full pl-12 text-xl bg-black/40 border-primary/30 font-mono placeholder:text-muted-foreground/50 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Search for anime..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <Button className="h-14 w-32 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" onClick={handleSearch}>
                    Search
                </Button>
            </div>
            {searchQuery.isLoading && <p>Loading...</p>}
            {searchQuery.isError && <p>Error: {searchQuery.error?.message}</p>}
            {searchQuery.data
                ?.sort((a, b) => {
                    if (a.averageScore && b.averageScore) {
                        return b.averageScore - a.averageScore;
                    }

                    return (a.title.romaji || "").localeCompare(
                        b.title.romaji || ""
                    );
                })
                .map((anime, i) => (
                    <AnimeCard
                        key={anime.id}
                        anime={anime}
                        index={i}
                    />
                ))}
        </div>
    );
}