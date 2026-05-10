import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { getTorrents, pauseTorrent, resumeTorrent, deleteTorrent } from "@/services/torrents";

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
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground">Manage active torrents in qBittorrent.</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Speed</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Loading torrents...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Failed to connect to qBittorrent. Check settings.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : torrents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No active downloads.
                </TableCell>
              </TableRow>
            ) : (
              torrents?.map((torrent) => (
                <TableRow key={torrent.hash}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-2 leading-tight" title={torrent.name}>
                      {torrent.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatBytes(torrent.size)}
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{(torrent.progress * 100).toFixed(1)}%</span>
                        {torrent.eta > 0 && torrent.progress < 1 && (
                          <span>{formatETA(torrent.eta)}</span>
                        )}
                      </div>
                      <Progress value={torrent.progress * 100} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      torrent.state.includes("downloading") ? "default" :
                      torrent.state.includes("paused") ? "secondary" :
                      torrent.state.includes("error") ? "destructive" :
                      torrent.state.includes("up") ? "success" : "outline"
                    } className="capitalize">
                      {torrent.state.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex flex-col text-xs space-y-0.5">
                      {torrent.downloadSpeed > 0 && (
                        <span className="text-green-400 font-medium">↓ {formatBytes(torrent.downloadSpeed)}/s</span>
                      )}
                      {torrent.uploadSpeed > 0 && (
                        <span className="text-blue-400 font-medium">↑ {formatBytes(torrent.uploadSpeed)}/s</span>
                      )}
                      {torrent.downloadSpeed === 0 && torrent.uploadSpeed === 0 && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center space-x-1">
                      {torrent.state.includes("paused") ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resumeMutation.mutate(torrent.hash)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => pauseMutation.mutate(torrent.hash)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => deleteMutation.mutate(torrent.hash)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
