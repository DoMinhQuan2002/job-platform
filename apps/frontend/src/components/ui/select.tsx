"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectChangeEvent = { target: { value: string } };

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (event: SelectChangeEvent) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  name?: string;
  "aria-label"?: string;
};

function Select({ value, defaultValue, onChange, disabled, className, children, name, "aria-label": ariaLabel }: SelectProps) {
  const options = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<{ value?: string; children?: React.ReactNode }>(child) || child.type !== "option") return [];
    return [{ value: String(child.props.value ?? ""), label: child.props.children }];
  });

  return (
    <SelectPrimitive.Root
      items={options}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={(nextValue) => onChange?.({ target: { value: nextValue ?? "" } })}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        data-slot="select-trigger"
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-white px-3 text-left text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] select-none",
          "hover:bg-slate-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-popup-open:border-primary data-popup-open:ring-3 data-popup-open:ring-primary/10",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value className="min-w-0 flex-1 truncate data-placeholder:text-muted-foreground" />
        <SelectPrimitive.Icon><ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform data-popup-open:rotate-180" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner className="z-[100] outline-none" sideOffset={6} alignItemWithTrigger={false}>
          <SelectPrimitive.Popup
            data-slot="select-content"
            className="min-w-[var(--anchor-width)] max-w-[min(24rem,var(--available-width))] origin-[var(--transform-origin)] overflow-hidden rounded-lg border border-border bg-white text-foreground shadow-lg outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <SelectPrimitive.ScrollUpArrow className="flex h-7 items-center justify-center border-b border-border bg-white text-muted-foreground"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpArrow>
            <SelectPrimitive.List className="max-h-72 overflow-y-auto p-1 scroll-py-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-md py-2 pl-2 pr-3 text-sm outline-none select-none data-highlighted:bg-primary/10 data-highlighted:text-primary data-selected:font-medium"
                >
                  <SelectPrimitive.ItemIndicator className="col-start-1 text-primary"><Check className="size-4" /></SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText className="col-start-2 truncate">{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow className="flex h-7 items-center justify-center border-t border-border bg-white text-muted-foreground"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownArrow>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };
