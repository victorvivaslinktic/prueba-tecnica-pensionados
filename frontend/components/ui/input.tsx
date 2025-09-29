import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-foreground/15 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
