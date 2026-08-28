import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type ItemActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
};

export function ItemActions({ onEdit, onDelete, deleting }: ItemActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-1.5 py-1 text-xs font-semibold text-primary hover:bg-primary/5 hover:text-primary/80"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
          Sửa
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-1.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive/80"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="size-4" />
          Xóa
        </Button>
      ) : null}
    </div>
  );
}
