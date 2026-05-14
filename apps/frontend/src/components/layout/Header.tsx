import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { testConnection } from "@/services/settings";
import { useQuery } from "@tanstack/react-query";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [isDark, setIsDark] = useState(true);

  // We enforce dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const { data: qbitStatus } = useQuery({
    queryKey: ["qbitStatus"],
    queryFn: testConnection,
    refetchInterval: 10000,
  });

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-primary/20 bg-background/40 px-6 glass-panel supports-backdrop-filter:bg-background/40">
      <h2 className="text-2xl font-syne tracking-tight text-primary text-glow-cyan">
        ANYHAVEN
      </h2>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        {qbitStatus !== undefined && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${qbitStatus.success ? 'bg-primary shadow-glow-cyan' : 'bg-destructive shadow-glow-magenta'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${qbitStatus.success ? 'bg-primary' : 'bg-destructive'}`}></span>
            </span>
            <span className="hidden sm:inline-block font-mono tracking-tight uppercase">
              {qbitStatus.success ? "qBit Linked" : "qBit Offline"}
            </span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
