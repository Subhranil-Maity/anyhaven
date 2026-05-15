import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { anilistGetAnimeById } from "@/services/anilist";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PlayCircle, Star, Info } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { releasesSearchById } from "@/services/releases";
import type { Anime } from "@repo/shared/types/anilist";
import { Downloadable } from "@/components/ui/releases/downloads";

export function AnimeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const cachedAnime = location.state?.anime as Anime | null;
    const { data: anime, isLoading, isError } = useQuery({
        queryKey: ["anime", id],
        queryFn: async () => {
            if (cachedAnime) return cachedAnime;
            return await anilistGetAnimeById(id!)
        },
        enabled: !!id
    });
    const releasesQuery = useQuery({
        queryKey: ["releases", id],
        queryFn: async () => await releasesSearchById(id!),
        enabled: !!id
    });

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="glass-panel rounded-2xl p-8 border-destructive/20 bg-destructive/5 text-center">
                    <Info className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
                    <p className="text-muted-foreground mb-6">We couldn't find the anime details you're looking for.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    if (isLoading || !anime) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin-reverse" />
                    </div>
                </div>
                <h2 className="text-xl font-syne font-bold animate-pulse text-primary tracking-widest uppercase">
                    Syncing with AniList...
                </h2>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20 animate-in fade-in duration-700">
            {/* Banner Section */}
            <div className="absolute -top-4 -left-4 -right-4 md:-top-8 md:-left-8 md:-right-8 h-[600px] overflow-hidden pointer-events-none">
                {anime.bannerImage ? (
                    <img
                        src={anime.bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 opacity-20" />
                )}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/40 to-background" />
                <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background opacity-40" />
            </div>

            <div className="container mx-auto px-4 pt-8 relative z-10">
                <Button
                    variant="ghost"
                    className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white transition-all group"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Search
                </Button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar / Poster */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-white/10 group">
                            <img
                                src={anime.coverImage.extraLarge || anime.coverImage.large || ""}
                                alt={anime.title.romaji}
                                className="w-full aspect-2/3 object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="glass-panel rounded-2xl p-6 border-white/5 bg-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Score</p>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-primary fill-primary" />
                                            <span className="text-lg font-syne font-bold">{anime.averageScore}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Episodes</p>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <PlayCircle className="w-4 h-4 text-secondary" />
                                            <span className="text-lg font-syne font-bold">{anime.episodes || "??"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="my-4 h-px bg-white/10" />
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${anime.status === 'RELEASING' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                        <span className="text-sm font-mono font-bold tracking-tight uppercase">{anime.status?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-6xl font-syne font-black text-white leading-tight tracking-tighter">
                                    {anime.title.romaji}
                                </h1>
                                {anime.title.english && (
                                    <h2 className="text-xl md:text-2xl font-medium text-muted-foreground/80 font-inter italic">
                                        {anime.title.english}
                                    </h2>
                                )}
                                {anime.title.native && (
                                    <p className="text-lg font-japanese text-primary/40">
                                        {anime.title.native}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {anime.genres?.map((genre) => (
                                    <Badge
                                        key={genre}
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-xs font-bold rounded-full hover:bg-primary/20 transition-colors"
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel rounded-3xl p-8 border-white/5 bg-black/20 backdrop-blur-sm">
                            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-primary/60 mb-6 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Synopsis
                            </h3>
                            <div
                                className="text-lg leading-relaxed text-muted-foreground font-inter description-container prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button className="h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 group">
                                <PlayCircle className="mr-3 h-6 w-6" />
                                Start Watching
                            </Button>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Add to Library
                            </Button>
                        </div>
                        <div className="mt-8">
                            <Downloadable releases={releasesQuery.data || []} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}