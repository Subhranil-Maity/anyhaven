import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-cyan transition-all font-bold",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow-magenta transition-all font-bold",
      outline: "border-2 border-primary/50 text-primary hover:bg-primary/10 hover:shadow-glow-cyan transition-all font-bold",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-glow-magenta transition-all font-bold",
      ghost: "hover:bg-white/5 hover:text-white transition-all font-bold",
      link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-all font-bold",
    }
    
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-4 text-xs",
      lg: "h-14 px-10 text-lg",
      icon: "h-11 w-11",
    }
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-mono text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
