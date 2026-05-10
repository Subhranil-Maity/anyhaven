import { History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data since history API might not exist yet
const mockHistory = [
  { id: 1, name: "Frieren: Beyond Journey's End - 01 (1080p)", date: "2024-03-22", status: "Completed" },
  { id: 2, name: "Jujutsu Kaisen Season 2 - 23 (1080p)", date: "2024-03-20", status: "Completed" },
  { id: 3, name: "Solo Leveling - 11 (1080p)", date: "2024-03-18", status: "Deleted" },
];

export function HistoryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">View your past downloads.</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[60%]">Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <History className="h-10 w-10 opacity-20" />
                    <p>No download history available.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              mockHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.status}
                    </span>
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
