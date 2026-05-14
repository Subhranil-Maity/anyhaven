import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { searchAnime } from "@/services/search";
import { addMagnet } from "@/services/torrents";
import { AnimeReleaseParser } from "@/lib/parser";

export function RawSearchPage() {
  const [query, setQuery] = useState("");
  const [episode, setEpisode] = useState("");
  const [quality, setQuality] = useState("");
  const [category, setCategory] = useState("1_2"); // Default to English translated
  const [activeSearch, setActiveSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: results, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["search", activeSearch, activeCategory],
    queryFn: () => searchAnime(activeSearch, activeCategory),
    enabled: !!activeSearch,
  });

  const { mutate: downloadMagnet, isPending: isDownloading } = useMutation({
    mutationFn: addMagnet,
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Torrent sent to qBittorrent successfully.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Download Failed",
        description: err.message || "Failed to send torrent to qBittorrent.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      let finalQuery = query.trim();

      if (episode.trim()) {
        finalQuery = `"${finalQuery} - ${episode.trim()}"`;
      }

      if (quality) {
        finalQuery = `${finalQuery} ${quality}`;
      }

      if (finalQuery === activeSearch && category === activeCategory) {
        refetch();
      } else {
        setActiveSearch(finalQuery);
        setActiveCategory(category);
        setSelectedGroups([]); // Reset filters on new search
      }
    }
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  // Extract available groups from results
  const availableGroups = Array.from(
    new Set(
      results?.map(r => new AnimeReleaseParser(r.title).parse().releaseGroup).filter(Boolean) as string[]
    )
  ).sort();

  // Filter results based on selected groups
  const filteredResults = results?.filter(r => {
    if (selectedGroups.length === 0) return true;
    const g = new AnimeReleaseParser(r.title).parse().releaseGroup;
    return g && selectedGroups.includes(g);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-5xl md:text-7xl font-syne font-black tracking-tighter text-glow-cyan">SEARCH</h1>
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Terminal // Nyaa Index</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col space-y-4 p-6 glass-panel rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query Title..."
              className="pl-12 h-14 text-xl bg-black/40 border-primary/30 focus-visible:border-primary placeholder:text-muted-foreground/50 font-syne font-bold"
            />
          </div>
          <Input
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            placeholder="Ep (01 or 1-12)"
            className="w-full sm:w-[160px] h-14 text-xl bg-black/40 border-primary/30 text-center font-mono placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="h-14 px-4 rounded-xl border border-primary/30 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:shadow-glow-cyan transition-colors hover:bg-primary/10 cursor-pointer flex-1"
          >
            <option value="">Any Quality</option>
            <option value="2160p">2160p (4K)</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-14 px-4 rounded-xl border border-primary/30 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:shadow-glow-cyan transition-colors hover:bg-primary/10 cursor-pointer flex-1"
          >
            <option value="">All Categories</option>
            <option value="1_0">Anime - All</option>
            <option value="1_2">Anime - English</option>
            <option value="1_3">Anime - Non-English</option>
            <option value="1_4">Anime - Raw</option>
            <option value="1_1">Anime - AMV</option>
          </select>
          <Button type="submit" className="h-14 px-10 text-lg uppercase tracking-widest sm:flex-none">
            Execute
          </Button>
        </div>
      </form>

      {isError && (
        <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive">
          <p className="font-semibold">Error searching torrents</p>
          <p className="text-sm opacity-90">{error.message}</p>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl glass-panel animate-pulse bg-white/5 border-white/10" />
            ))}
          </div>
        ) : filteredResults?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground glass-panel rounded-2xl border-dashed border-white/20">
            <p className="font-mono text-lg uppercase tracking-widest text-primary/50">NO DATA FOUND</p>
          </div>
        ) : (
          <>
            {availableGroups.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mr-2">Filter Groups:</span>
                {availableGroups.map((g) => (
                  <Badge
                    key={g}
                    variant={selectedGroups.includes(g) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-black transition-colors"
                    onClick={() => toggleGroup(g)}
                  >
                    {g}
                  </Badge>
                ))}
                {selectedGroups.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs font-mono text-muted-foreground hover:text-white" onClick={() => setSelectedGroups([])}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredResults?.map((result, i) => {
                const parsed = new AnimeReleaseParser(result.title).parse()
                const displayTitle = parsed.animeTitle || result.title

                return (
                  <div
                    key={result.guid}
                    className="group relative flex flex-col sm:flex-row glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-cyan hover:border-primary/50 hover:-translate-y-1"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Left Color Bar Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-secondary opacity-50 group-hover:opacity-100" />

                    <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-syne font-bold text-xl md:text-2xl leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors" title={result.title}>
                          {displayTitle}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground mt-2 line-clamp-1" title={result.title}>{result.title}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        {parsed.episode !== null && (
                          <Badge variant="default" className="text-sm px-2 py-0.5">
                            EP {parsed.episode}
                          </Badge>
                        )}
                        {parsed.releaseGroup && (
                          <Badge variant="secondary" className="px-2 py-0.5">
                            {parsed.releaseGroup}
                          </Badge>
                        )}
                        {parsed.resolution && (
                          <Badge variant="outline" className="border-primary/30 text-primary px-2 py-0.5 bg-primary/5">
                            {parsed.resolution}
                          </Badge>
                        )}
                        {parsed.isBatch && (
                          <Badge variant="success" className="px-2 py-0.5">
                            BATCH
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-black/40 sm:w-48 p-6 flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 sm:border-l border-white/10">
                      <div className="flex flex-col items-start sm:items-end font-mono">
                        <span className="text-xl font-bold text-white">{result.size}</span>
                        <div className="flex gap-3 text-xs mt-1 font-bold">
                          <span className="text-green-400">S:{result.seeders}</span>
                          <span className="text-red-400">L:{result.leechers}</span>
                        </div>
                      </div>

                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-xl"
                        onClick={() => downloadMagnet(result.magnet || result.link)}
                        disabled={isDownloading}
                        title="Send to qBittorrent"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!activeSearch && !isLoading && !isError && (
          <div className="h-64 flex flex-col items-center justify-center space-y-6 glass-panel rounded-2xl border-white/5 opacity-50">
            <div className="relative">
              <Search className="h-16 w-16 text-primary absolute opacity-50 blur-xl" />
              <Search className="h-16 w-16 text-primary relative z-10" />
            </div>
            <p className="font-mono uppercase tracking-widest text-sm text-primary">Awaiting Query Input</p>
          </div>
        )}
      </div>
    </div>
  );
}
