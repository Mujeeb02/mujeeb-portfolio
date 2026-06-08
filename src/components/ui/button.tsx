import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-mono transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(var(--neon-green)/0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]",
        secondary:
          "border border-secondary bg-transparent text-secondary hover:bg-secondary/10 hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]",
        ghost: 
          "text-muted-foreground hover:text-primary hover:bg-primary/5",
        link: 
          "text-primary underline-offset-4 hover:underline",
        terminal:
          "bg-terminal-gray border border-border text-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_15px_hsl(var(--neon-green)/0.3)] before:content-['$'] before:mr-2 before:text-muted-foreground",
        neon:
          "bg-transparent border-2 border-primary text-primary animate-pulse-glow hover:bg-primary hover:text-primary-foreground",
        cyber:
          "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50 text-foreground hover:from-primary/30 hover:to-secondary/30 hover:border-primary",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
