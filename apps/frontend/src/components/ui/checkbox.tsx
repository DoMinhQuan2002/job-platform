import * as React from "react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return <input type="checkbox" data-slot="checkbox" className={cn("size-4 rounded border-border accent-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/30", className)} {...props} />;
}

export { Checkbox };
