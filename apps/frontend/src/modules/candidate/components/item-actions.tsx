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
          className="h-auto gap-1 px-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
          Sửa
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto gap-1 px-0 text-xs font-semibold text-destructive hover:bg-transparent hover:text-destructive/80"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="size-3" />
          Xóa
        </Button>
      ) : null}
    </div>
  );
}
