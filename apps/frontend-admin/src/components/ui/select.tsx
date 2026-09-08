"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectChangeEvent = { target: { value: string } };

type SelectSize = "sm" | "md" | "lg";

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (event: SelectChangeEvent) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  name?: string;
  "aria-label"?: string;
  size?: SelectSize;
};

const sizeClasses: Record<SelectSize, string> = {
  sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
  md: "h-9.5 px-3.5 text-sm rounded-lg gap-2",
  lg: "h-10 px-3.5 text-sm rounded-lg gap-2",
};

function Select({
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  children,
  name,
  "aria-label": ariaLabel,
  size = "md",
}: SelectProps) {
  const options = React.Children.toArray(children).flatMap((child) => {
    if (
      !React.isValidElement<{ value?: string; children?: React.ReactNode }>(child) ||
      child.type !== "option"
    ) {
      return [];
    }
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
          "flex w-full items-center justify-between border border-slate-200 bg-white text-left font-medium text-slate-800 shadow-2xs outline-none transition-all select-none cursor-pointer",
          "hover:border-slate-300 hover:bg-slate-50/80 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 data-popup-open:border-blue-500 data-popup-open:ring-2 data-popup-open:ring-blue-500/15",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          className
        )}
      >
        <SelectPrimitive.Value className="min-w-0 flex-1 truncate data-placeholder:text-slate-400" />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform duration-150 data-popup-open:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner className="z-[100] outline-none" sideOffset={6} alignItemWithTrigger={false}>
          <SelectPrimitive.Popup
            data-slot="select-content"
            className="min-w-[var(--anchor-width)] max-w-[min(24rem,var(--available-width))] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-slate-200/90 bg-white text-slate-800 shadow-xl outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <SelectPrimitive.List className="max-h-64 overflow-y-auto p-1.5 scroll-py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-2 rounded-lg py-2 pl-2 pr-3 text-xs md:text-sm outline-none select-none transition-colors data-highlighted:bg-blue-50 data-highlighted:text-blue-600 data-selected:font-semibold data-selected:text-blue-600"
                >
                  <SelectPrimitive.ItemIndicator className="col-start-1 text-blue-600">
                    <Check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText className="col-start-2 truncate">
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };
