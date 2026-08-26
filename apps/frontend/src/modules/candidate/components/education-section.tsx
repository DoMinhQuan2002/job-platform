"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, Plus } from "lucide-react";
import { formatDateRange } from "../lib/format";
import type { Education, EducationFormInput } from "../types";
import { EducationFormModal } from "./education-form-modal";
import { ItemActions } from "./item-actions";
import { ProfileCard } from "./profile-card";
import { SectionHeader } from "./section-header";

type EducationSectionProps = {
  educations: Education[];
  saving: boolean;
  onCreate: (input: EducationFormInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<EducationFormInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function EducationSection({
  educations,
  saving,
  onCreate,
  onUpdate,
  onDelete,
}: EducationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Education | null>(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: Education) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <>
      <ProfileCard className="space-y-4">
        <SectionHeader
          title="Học vấn"
          icon={<GraduationCap className="size-5" />}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={openCreate}
            >
              <Plus className="size-3.5" />
              Thêm học vấn
            </Button>
          }
        />

        {educations.length === 0 ? (
          <p className="py-4 text-sm text-muted">Chưa có thông tin học vấn.</p>
        ) : (
          <ul className="space-y-3">
            {educations.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-[#f9f9ff]">
                    <GraduationCap className="size-7 text-primary/70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">{item.school}</h3>
                    <p className="text-sm text-muted">
                      {[item.major, item.degree].filter(Boolean).join(" • ")}
                    </p>
                    <div className="flex items-center gap-1 pt-1 text-xs font-semibold text-[#737686]">
                      <Calendar className="size-3" />
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </div>
                  </div>
                </div>
                <ItemActions
                  onEdit={() => openEdit(item)}
                  onDelete={() => {
                    if (window.confirm("Xóa mục học vấn này?")) {
                      void onDelete(item.id);
                    }
                  }}
                  deleting={saving}
                />
              </li>
            ))}
          </ul>
        )}
      </ProfileCard>

      <EducationFormModal
        open={modalOpen}
        saving={saving}
        editingItem={editingItem}
        onClose={closeModal}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </>
  );
}
