import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { fineSearchAnime, type FineSearchQuery } from "@/services/search";
import { addTorrent } from "@/services/torrents";

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

import type { AggregatedTorrent } from "@/services/search";

function TorrentRow({ t, onDownload }: { t: AggregatedTorrent, onDownload: (magnet: string) => void }) {
  const n = t.normalized;
  const scoreColor = n.qualityScore >= 100 ? "text-primary border-primary/30 bg-primary/10" : 
                     n.qualityScore >= 50 ? "text-green-400 border-green-500/30 bg-green-500/10" : 
                     "text-secondary border-secondary/30 bg-secondary/10";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 transition-all gap-4 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className={`font-mono text-xs ${scoreColor}`}>
            Score: {n.qualityScore || 0}
          </Badge>
          {n.releaseGroup && <Badge variant="secondary" className="font-mono text-xs">{n.releaseGroup}</Badge>}
          {n.resolution && <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">{n.resolution}</Badge>}
          {n.source && <Badge variant="default" className="font-mono text-xs bg-white/10 text-white">{n.source}</Badge>}
        </div>
        <p className="font-mono text-sm text-white truncate group-hover:text-primary transition-colors" title={t.title}>{t.title}</p>
        <div className="flex gap-4 mt-2 font-mono text-xs text-muted-foreground">
          <span className="text-green-400 font-bold">S: {t.seeders}</span>
          <span>{formatBytes(t.size)}</span>
          <span>Conf: {t.confidence}%</span>
        </div>
      </div>
      <Button 
        size="icon" 
        className="shrink-0 h-12 w-12 rounded-xl bg-white/5 hover:bg-primary hover:text-black hover:shadow-glow-cyan text-white transition-all"
        onClick={() => onDownload(t.magnet || t.link)}
      >
        <Download className="h-5 w-5" />
      </Button>
    </div>
  )
}

export function FineSearchPage() {
  const [query, setQuery] = useState<FineSearchQuery>({
    animeTitle: "",
  });
  
  const [activeQuery, setActiveQuery] = useState<FineSearchQuery | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ["finesearch", activeQuery],
    queryFn: () => fineSearchAnime(activeQuery!),
    enabled: !!activeQuery?.animeTitle,
  });

  const { mutate: downloadMagnet } = useMutation({
    mutationFn: addTorrent,
    onSuccess: () => {
      toast({ title: "Download Started", description: "Torrent sent to qBittorrent successfully.", variant: "success" });
    },
    onError: (err: Error) => {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.animeTitle.trim()) {
      setActiveQuery({ ...query });
      setSelectedGroups([]); // Reset filters on new search
    } else {
      toast({ title: "Validation Error", description: "Anime Title is required.", variant: "destructive" });
    }
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const updateQuery = (key: keyof FineSearchQuery, value: any) => {
    setQuery(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-5xl md:text-7xl font-syne font-black tracking-tighter text-glow-magenta text-secondary">FINE SEARCH</h1>
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Advanced Data Aggregation // Protocol</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col space-y-6 p-6 md:p-8 glass-panel rounded-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Title Input - Full Width */}
          <div className="md:col-span-12">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Primary Target</label>
            <div className="relative">
              <Database className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <Input
                value={query.animeTitle}
                onChange={(e) => updateQuery("animeTitle", e.target.value)}
                placeholder="Anime Title (Required)..."
                className="pl-12 h-16 text-2xl bg-black/50 border-secondary/30 focus-visible:border-secondary focus-visible:shadow-glow-magenta font-syne font-bold"
                required
              />
            </div>
          </div>

          {/* Season & Episode Range */}
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Season</label>
            <Input
              type="number"
              value={query.season || ""}
              onChange={(e) => updateQuery("season", e.target.value ? parseInt(e.target.value) : undefined)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="S#"
              className="h-12 bg-black/40 border-white/10 font-mono"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Single Episode</label>
            <Input
              type="number"
              value={query.episode || ""}
              onChange={(e) => updateQuery("episode", e.target.value ? parseInt(e.target.value) : undefined)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Ep#"
              className="h-12 bg-black/40 border-white/10 font-mono"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Range Start</label>
            <Input
              type="number"
              value={query.episodeStart || ""}
              onChange={(e) => updateQuery("episodeStart", e.target.value ? parseInt(e.target.value) : undefined)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Start Ep#"
              className="h-12 bg-black/40 border-white/10 font-mono"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Range End</label>
            <Input
              type="number"
              value={query.episodeEnd || ""}
              onChange={(e) => updateQuery("episodeEnd", e.target.value ? parseInt(e.target.value) : undefined)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="End Ep#"
              className="h-12 bg-black/40 border-white/10 font-mono"
            />
          </div>

          {/* Preferences */}
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Category</label>
            <select
              value={query.category || ""}
              onChange={(e) => updateQuery("category", e.target.value || undefined)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:border-secondary transition-colors cursor-pointer"
            >
              <option value="">English-translated (Default)</option>
              <option value="1_3">Non-English-translated</option>
              <option value="1_4">Raw</option>
              <option value="4_2">Live Action - English</option>
              <option value="4_4">Live Action - Raw</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Resolution</label>
            <select
              value={query.preferredResolution || ""}
              onChange={(e) => updateQuery("preferredResolution", e.target.value || undefined)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:border-secondary transition-colors cursor-pointer"
            >
              <option value="">Any</option>
              <option value="2160p">2160p (4K)</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Source</label>
            <select
              value={query.preferredSource || ""}
              onChange={(e) => updateQuery("preferredSource", e.target.value || undefined)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:border-secondary transition-colors cursor-pointer"
            >
              <option value="">Any</option>
              <option value="Blu-ray">Blu-ray</option>
              <option value="Web">Web</option>
              <option value="TV">TV</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Codec</label>
            <select
              value={query.preferredCodec || ""}
              onChange={(e) => updateQuery("preferredCodec", e.target.value || undefined)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/40 text-sm font-mono focus-visible:outline-none focus-visible:border-secondary transition-colors cursor-pointer"
            >
              <option value="">Any</option>
              <option value="HEVC">HEVC / H.265</option>
              <option value="AVC">AVC / H.264</option>
              <option value="AV1">AV1</option>
            </select>
          </div>

          {/* Groups */}
          <div className="md:col-span-6">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Preferred Groups (Comma sep)</label>
            <Input
              value={query.preferredGroups?.join(",") || ""}
              onChange={(e) => updateQuery("preferredGroups", e.target.value ? e.target.value.split(",") : undefined)}
              placeholder="e.g. SubsPlease, Erai-raws"
              className="h-12 bg-black/40 border-white/10 font-mono"
            />
          </div>
          <div className="md:col-span-6">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Exclude Groups (Comma sep)</label>
            <Input
              value={query.excludeGroups?.join(",") || ""}
              onChange={(e) => updateQuery("excludeGroups", e.target.value ? e.target.value.split(",") : undefined)}
              placeholder="e.g. Judas, ASW"
              className="h-12 bg-black/40 border-white/10 font-mono text-destructive focus-visible:border-destructive"
            />
          </div>

          {/* Toggles */}
          <div className="md:col-span-12 flex flex-wrap gap-4 items-center bg-black/30 p-4 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-sm group">
              <input 
                type="checkbox" 
                checked={query.isBatch || false} 
                onChange={(e) => updateQuery("isBatch", e.target.checked ? true : undefined)}
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-secondary focus:ring-secondary/50 accent-secondary"
              />
              <span className="group-hover:text-white transition-colors">Batch Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-mono text-sm group">
              <input 
                type="checkbox" 
                checked={query.dualAudio || false} 
                onChange={(e) => updateQuery("dualAudio", e.target.checked ? true : undefined)}
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-secondary focus:ring-secondary/50 accent-secondary"
              />
              <span className="group-hover:text-white transition-colors">Dual Audio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-mono text-sm group">
              <input 
                type="checkbox" 
                checked={query.allowMultiSub || false} 
                onChange={(e) => updateQuery("allowMultiSub", e.target.checked ? true : undefined)}
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-secondary focus:ring-secondary/50 accent-secondary"
              />
              <span className="group-hover:text-white transition-colors">Multi-Sub</span>
            </label>
            
            <div className="ml-auto flex items-center gap-2">
              <label className="font-mono text-sm whitespace-nowrap">Min Seeders:</label>
              <Input
                type="number"
                value={query.minimumSeeders || ""}
                onChange={(e) => updateQuery("minimumSeeders", e.target.value ? parseInt(e.target.value) : undefined)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                className="w-20 h-10 bg-black/40 border-white/10 text-center font-mono"
              />
            </div>
          </div>
          
          <div className="md:col-span-12 mt-4">
            <Button type="submit" className="w-full h-16 text-xl uppercase tracking-widest font-syne font-black rounded-2xl bg-secondary hover:bg-secondary/90 hover:shadow-glow-magenta text-white">
              Initialize Fine Search
            </Button>
          </div>
        </div>
      </form>

      {/* RESULTS AREA */}
      <div className="mt-12 space-y-6">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl glass-panel animate-pulse bg-white/5 border-white/10" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-8 rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive shadow-glow-magenta flex flex-col items-center justify-center text-center">
            <p className="font-syne font-bold text-2xl uppercase">Aggregation Failure</p>
            <p className="font-mono mt-2 opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !isError && activeQuery && results?.groups?.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground glass-panel rounded-2xl border-dashed border-white/20">
            <p className="font-mono text-lg uppercase tracking-widest text-secondary/50">NO AGGREGATED GROUPS FOUND</p>
          </div>
        )}

        {results?.groups && results.groups.length > 0 && (() => {
          const allTorrents = results.groups.flatMap(g => g.torrents);
          
          const availableGroups = Array.from(
            new Set(allTorrents.map(t => t.normalized.releaseGroup).filter(Boolean) as string[])
          ).sort();

          const filteredTorrents = allTorrents.filter(t => {
            if (selectedGroups.length === 0) return true;
            const g = t.normalized.releaseGroup;
            return g && selectedGroups.includes(g);
          });

          const batchTorrents = filteredTorrents.filter(t => t.normalized.isBatch);
          const episodicTorrents = filteredTorrents.filter(t => !t.normalized.isBatch);
          
          const epsMap = new Map<number, typeof episodicTorrents>();
          const unknownEpTorrents: typeof episodicTorrents = [];
          
          episodicTorrents.forEach(t => {
            const ep = t.normalized.episode;
            if (ep !== undefined && ep !== null) {
              if (!epsMap.has(ep)) epsMap.set(ep, []);
              epsMap.get(ep)!.push(t);
            } else {
              unknownEpTorrents.push(t);
            }
          });
          
          const sortedEpisodes = Array.from(epsMap.keys()).sort((a, b) => b - a);

          return (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-4 gap-4">
                <h2 className="font-syne text-2xl font-bold text-white">Processed Aggregations</h2>
                <span className="font-mono text-sm text-muted-foreground">{filteredTorrents.length} Files Displayed</span>
              </div>

              {availableGroups.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 glass-panel p-4 rounded-xl border border-white/5">
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
              
              {filteredTorrents.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground glass-panel rounded-2xl border-dashed border-white/20">
                  <p className="font-mono text-sm uppercase tracking-widest text-primary/50">ALL FILES FILTERED OUT</p>
                </div>
              )}

              {batchTorrents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-syne font-black text-3xl text-secondary shadow-glow-magenta inline-block px-2">BATCH RELEASES</h3>
                  <div className="space-y-3 glass-panel p-6 rounded-2xl border border-secondary/20 bg-secondary/5">
                    {batchTorrents.sort((a, b) => (b.normalized.qualityScore || 0) - (a.normalized.qualityScore || 0)).map((t, i) => (
                      <TorrentRow key={`batch-${i}`} t={t} onDownload={downloadMagnet} />
                    ))}
                  </div>
                </div>
              )}

              {sortedEpisodes.length > 0 && (
                <div className="space-y-8">
                  {sortedEpisodes.map(ep => {
                    const epTorrents = epsMap.get(ep)!.sort((a, b) => (b.normalized.qualityScore || 0) - (a.normalized.qualityScore || 0));
                    return (
                      <div key={`ep-${ep}`} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <h3 className="font-syne font-black text-3xl text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">EPISODE {ep}</h3>
                          <Badge variant="outline" className="border-white/10 text-white/50">{epTorrents.length} Sources</Badge>
                        </div>
                        <div className="space-y-3 glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5">
                          {epTorrents.map((t, i) => (
                            <TorrentRow key={`ep-${ep}-${i}`} t={t} onDownload={downloadMagnet} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {unknownEpTorrents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-syne font-black text-2xl text-muted-foreground">Uncategorized / Movies / OVAs</h3>
                  <div className="space-y-3 glass-panel p-6 rounded-2xl border border-white/10">
                    {unknownEpTorrents.sort((a, b) => (b.normalized.qualityScore || 0) - (a.normalized.qualityScore || 0)).map((t, i) => (
                      <TorrentRow key={`unk-${i}`} t={t} onDownload={downloadMagnet} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
