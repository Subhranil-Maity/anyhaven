import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { getTorrents, pauseTorrent, resumeTorrent, deleteTorrent } from "@/services/torrents";
import { AnimeReleaseParser } from "@/lib/parser";

export function DownloadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: torrents, isLoading, isError } = useQuery({
    queryKey: ["torrents"],
    queryFn: getTorrents,
    refetchInterval: 2000, // Poll every 2s
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["torrents"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  };

  const pauseMutation = useMutation({ mutationFn: pauseTorrent, ...mutationOptions });
  const resumeMutation = useMutation({ mutationFn: resumeTorrent, ...mutationOptions });
  const deleteMutation = useMutation({
    mutationFn: (hash: string) => deleteTorrent(hash, false),
    ...mutationOptions,
    onSuccess: () => {
      toast({ title: "Torrent Deleted", description: "The torrent has been removed." });
      mutationOptions.onSuccess();
    }
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const formatETA = (seconds: number) => {
    if (seconds === 8640000) return "∞"; // qBit infinite ETA
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-5xl md:text-7xl font-syne font-black tracking-tighter text-glow-magenta">DOWNLOADS</h1>
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Terminal // Active Links</p>
      </div>

      <div className="flex flex-col space-y-4 mt-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl glass-panel animate-pulse bg-white/5 border-white/10" />
          ))
        ) : isError ? (
          <div className="h-48 flex flex-col items-center justify-center space-y-4 text-destructive glass-panel rounded-2xl border-dashed border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-10 w-10 opacity-80" />
            <p className="font-mono text-lg uppercase tracking-widest text-destructive/80">CONNECTION SEVERED</p>
          </div>
        ) : torrents?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground glass-panel rounded-2xl border-dashed border-white/20">
            <p className="font-mono text-lg uppercase tracking-widest text-primary/50">NO ACTIVE TRANSMISSIONS</p>
          </div>
        ) : (
          torrents?.map((torrent, i) => {
            const parsed = new AnimeReleaseParser(torrent.name).parse()
            const displayTitle = parsed.animeTitle || torrent.name
            const progressPercent = (torrent.progress * 100).toFixed(1)
            const isPaused = torrent.state.includes("paused") || torrent.state.includes("stopped")
            
            return (
              <div 
                key={torrent.hash}
                className="group relative flex flex-col md:flex-row glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-magenta hover:border-secondary/50"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Left Color Bar Accent based on state */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-80 transition-colors ${
                  torrent.state.includes("downloading") ? "bg-primary shadow-glow-cyan" :
                  isPaused ? "bg-muted-foreground" :
                  torrent.state.includes("error") ? "bg-destructive shadow-glow-magenta" :
                  torrent.state.includes("up") ? "bg-green-400" : "bg-secondary"
                }`} />
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-syne font-bold text-xl leading-tight line-clamp-1 text-white" title={torrent.name}>
                        {displayTitle}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={
                          torrent.state.includes("downloading") ? "default" :
                          isPaused ? "outline" :
                          torrent.state.includes("error") ? "destructive" :
                          torrent.state.includes("up") ? "success" : "secondary"
                        } className="capitalize py-0.5 shadow-none text-xs">
                          {torrent.state.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                        
                        {parsed.episode !== null && (
                          <Badge variant="outline" className="border-white/10 text-white/70 py-0.5 text-xs">
                            EP {parsed.episode}
                          </Badge>
                        )}
                        {parsed.resolution && (
                          <Badge variant="outline" className="border-white/10 text-white/70 py-0.5 text-xs">
                            {parsed.resolution}
                          </Badge>
                        )}
                        <span className="text-xs font-mono text-muted-foreground self-center ml-2">{formatBytes(torrent.size)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col space-y-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between text-sm font-mono font-bold">
                        <span className="text-white">GLOBAL PROGRESS: {progressPercent}%</span>
                        {torrent.eta > 0 && torrent.progress < 1 && (
                          <span className="text-primary tracking-widest">{formatETA(torrent.eta)} REMAINING</span>
                        )}
                      </div>
                      <Progress value={torrent.progress * 100} className={`h-2 ${isPaused ? 'opacity-50' : ''}`} />
                    </div>

                    {torrent.files && torrent.files.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Active Files</p>
                        <div className="grid grid-cols-1 gap-3">
                          {torrent.files.map((file) => (
                            <div key={file.index} className="flex flex-col space-y-1.5 group/file">
                              <div className="flex justify-between items-center text-[11px] font-mono">
                                <span className="text-white/70 line-clamp-1 flex-1 pr-4 group-hover/file:text-primary transition-colors" title={file.name}>
                                  {file.name.split(/[\\/]/).pop()}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground/50">{formatBytes(file.size)}</span>
                                  <span className={file.progress === 1 ? "text-green-400" : "text-primary"}>
                                    {(file.progress * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${file.progress === 1 ? "bg-green-400/50" : "bg-primary/40"}`}
                                  style={{ width: `${file.progress * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <div className="bg-black/40 md:w-64 p-6 flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-white/10">
                  <div className="flex flex-row md:flex-col gap-4 md:gap-1 text-sm font-mono items-center md:items-end">
                    {torrent.downloadSpeed > 0 && (
                      <span className="text-primary font-bold tracking-tight">↓ {formatBytes(torrent.downloadSpeed)}/s</span>
                    )}
                    {torrent.uploadSpeed > 0 && (
                      <span className="text-green-400 font-bold tracking-tight">↑ {formatBytes(torrent.uploadSpeed)}/s</span>
                    )}
                    {torrent.downloadSpeed === 0 && torrent.uploadSpeed === 0 && (
                      <span className="text-muted-foreground tracking-widest">IDLE</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isPaused ? (
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" onClick={() => resumeMutation.mutate(torrent.hash)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" onClick={() => pauseMutation.mutate(torrent.hash)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="destructive" size="icon" className="h-10 w-10 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive hover:text-white" onClick={() => deleteMutation.mutate(torrent.hash)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
