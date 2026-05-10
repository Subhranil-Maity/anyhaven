import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-primary/50 bg-primary/10 text-primary shadow-glow-cyan",
    secondary: "border-secondary/50 bg-secondary/10 text-secondary shadow-glow-magenta",
    destructive: "border-destructive/50 bg-destructive/10 text-destructive",
    outline: "text-foreground border-white/20 bg-black/40",
    success: "border-green-500/50 bg-green-500/10 text-green-400",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
