import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-[120ms] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm active:translate-x-0 active:translate-y-0 active:shadow-none",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
        outline: "border-foreground text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
