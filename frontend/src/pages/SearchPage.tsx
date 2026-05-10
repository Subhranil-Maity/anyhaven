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
import { AnimeReleaseParser } from "@/lib/parser";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const { toast } = useToast();

  const { data: results, isLoading, isError, error } = useQuery({
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
      setActiveSearch(query.trim());
      setActiveCategory(category);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Search Anime</h1>
        <p className="text-muted-foreground">Find and download anime torrents from Nyaa.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime... (Press Enter)"
            className="pl-10 h-12 text-lg rounded-none bg-card border-muted-foreground/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 px-4 rounded-none border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="1_0">Anime - All</option>
            <option value="1_2">Anime - English</option>
            <option value="1_3">Anime - Non-English</option>
            <option value="1_4">Anime - Raw</option>
            <option value="1_1">Anime - AMV</option>
          </select>
          <Button type="submit" className="h-12 px-8 rounded-none">
            Search
          </Button>
        </div>
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
              results?.map((result) => {
                const parsed = new AnimeReleaseParser(result.title).parse()
                const displayTitle = parsed.animeTitle || result.title
                
                return (
                  <TableRow key={result.guid} className="group transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col space-y-1.5">
                        <span className="line-clamp-2 leading-tight" title={result.title}>
                          {displayTitle}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {parsed.episode !== null && (
                            <Badge variant="default" className="h-5 px-1.5 py-0 text-[10px]">
                              Ep {parsed.episode}
                            </Badge>
                          )}
                          {parsed.releaseGroup && (
                            <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                              {parsed.releaseGroup}
                            </Badge>
                          )}
                          {parsed.resolution && (
                            <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px]">
                              {parsed.resolution}
                            </Badge>
                          )}
                          {parsed.isBatch && (
                            <Badge variant="success" className="h-5 px-1.5 py-0 text-[10px]">
                              Batch
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-1 self-center">
                            {result.publishedAt}
                          </span>
                        </div>
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
                )
              })
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
