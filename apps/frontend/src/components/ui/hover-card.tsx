"use client";

import * as React from "react";
import { PreviewCard as HoverCardPrimitive } from "@base-ui/react/preview-card";
import { cn } from "@/lib/utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root {...props} />;
}

function HoverCardTrigger({
  delay,
  openDelay,
  closeDelay,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger> & {
  openDelay?: number;
}) {
  return (
    <HoverCardPrimitive.Trigger
      delay={openDelay ?? delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

const HoverCardPortal = HoverCardPrimitive.Portal;

function HoverCardContent({
  className,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Popup> & {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <HoverCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-auto max-w-xs rounded-lg border border-slate-200/90 bg-white p-2.5 text-slate-800 shadow-md outline-none will-change-[transform,opacity]",
            "transition-[opacity,transform] duration-75 ease-out",
            "data-starting-style:opacity-0 data-starting-style:-translate-y-1",
            "data-ending-style:opacity-0 data-ending-style:-translate-y-1",
            className
          )}
          {...props}
        >
          {children}
        </HoverCardPrimitive.Popup>
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal };
