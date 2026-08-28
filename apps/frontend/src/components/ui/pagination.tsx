"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  ariaLabel?: string;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  ariaLabel = "Phân trang",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("mt-7 flex flex-wrap justify-center gap-1", className)}
      aria-label={ariaLabel}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="group hover:bg-primary/10! hover:text-primary!"
        aria-label="Trang trước"
      >
        <ChevronLeft className="group-hover:text-primary" />
      </Button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span
            key={`ellipsis-${index}`}
            className="grid size-7 place-items-center text-xs text-muted"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? "default" : "outline"}
            size="icon-sm"
            className={cn(item !== page && "hover:bg-primary/10! hover:text-primary!")}
            onClick={() => onPageChange(item)}
            aria-label={`Trang ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={page >= totalPages}
        className="group hover:bg-primary/10! hover:text-primary!"
        onClick={() => onPageChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight className="group-hover:text-primary" />
      </Button>
    </nav>
  );
}

function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const values: Array<number | "…"> = [1];
  if (page > 3) values.push("…");

  for (
    let value = Math.max(2, page - 1);
    value <= Math.min(totalPages - 1, page + 1);
    value += 1
  ) {
    values.push(value);
  }

  if (page < totalPages - 2) values.push("…");
  values.push(totalPages);
  return values;
}
