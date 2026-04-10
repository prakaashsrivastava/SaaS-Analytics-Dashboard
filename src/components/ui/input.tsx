import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/10",
        className
      )}
      {...props}
    />
  );
}

export { Input };
