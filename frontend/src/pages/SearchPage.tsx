import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { searchAnime } from "@/services/search";
import { addMagnet } from "@/services/torrents";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { toast } = useToast();

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ["search", activeSearch],
    queryFn: () => searchAnime(activeSearch),
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
      setActiveSearch(query.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Search Anime</h1>
        <p className="text-muted-foreground">Find and download anime torrents from Nyaa.</p>
      </div>

      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime... (Press Enter)"
            className="pl-9 h-12 text-lg rounded-xl bg-card border-muted-foreground/20"
          />
        </div>
        <Button type="submit" className="h-12 px-6 rounded-xl">
          Search
        </Button>
      </form>

      {isError && (
        <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive">
          <p className="font-semibold">Error searching torrents</p>
          <p className="text-sm opacity-90">{error.message}</p>
        </div>
      )}

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50%]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Seeders</TableHead>
              <TableHead className="text-right">Leechers</TableHead>
              <TableHead className="w-[100px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 mx-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No results found. Try a different search term.
                </TableCell>
              </TableRow>
            ) : (
              results?.map((result) => (
                <TableRow key={result.guid} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col space-y-1">
                      <span className="line-clamp-2 leading-tight" title={result.title}>
                        {result.title}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center space-x-2">
                        <span>{result.publishedAt}</span>
                        {result.seeders > 100 && (
                          <Badge variant="success" className="h-4 text-[10px] px-1 py-0">Hot</Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {result.size}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-500">
                    {result.seeders}
                  </TableCell>
                  <TableCell className="text-right text-red-400">
                    {result.leechers}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadMagnet(result.magnet || result.link)}
                      disabled={isDownloading}
                      title="Send to qBittorrent"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!activeSearch && !isLoading && !isError && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="h-10 w-10 opacity-20" />
                    <p>Enter a search query to find anime torrents.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
