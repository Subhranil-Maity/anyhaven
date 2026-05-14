import { Link, useLocation } from "react-router-dom";
import { Search, Download, History, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Search", href: "/", icon: Search },
  { name: "Raw Search", href: "/rawsearch", icon: Search },
  { name: "Fine Search", href: "/finesearch", icon: Target },
  { name: "Downloads", href: "/downloads", icon: Download },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <div className={cn("pb-12 w-64 border-r bg-card/50 hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">

          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-3 text-sm font-bold transition-all duration-300 group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-glow-cyan"
                      : "transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                  )} />
                  <span className="font-mono tracking-wider uppercase text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
