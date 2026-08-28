"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Plus } from "lucide-react";
import { formatDateRange } from "../lib/format";
import type { WorkExperience, WorkExperienceFormInput } from "../types";
import { ExperienceFormModal } from "./experience-form-modal";
import { ItemActions } from "./item-actions";
import { ProfileCard } from "./profile-card";
import { SectionHeader } from "./section-header";

type ExperienceSectionProps = {
  experiences: WorkExperience[];
  saving: boolean;
  onCreate: (input: WorkExperienceFormInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<WorkExperienceFormInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ExperienceSection({
  experiences,
  saving,
  onCreate,
  onUpdate,
  onDelete,
}: ExperienceSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: WorkExperience) => {
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
          title="Kinh nghiệm làm việc"
          icon={<Briefcase className="size-5" />}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={openCreate}
            >
              <Plus className="size-4" />
              Thêm kinh nghiệm
            </Button>
          }
        />

        {experiences.length === 0 ? (
          <p className="py-4 text-sm text-muted">Chưa có kinh nghiệm làm việc.</p>
        ) : (
          <ul className="space-y-3">
            {experiences.map((item) => (
              <li
                key={item.id}
                className="grid gap-4 rounded-lg p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-start"
              >
                <div className="flex gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-[#f9f9ff]">
                    <Briefcase className="size-7 text-primary/70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">{item.companyName}</h3>
                    <p className="text-sm text-muted">{item.position}</p>
                    <div className="flex items-center gap-1 pt-1 text-xs font-semibold text-[#737686]">
                      <Calendar className="size-3" />
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </div>
                  </div>
                </div>
                {item.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted/70">Không có mô tả.</p>
                )}
                <ItemActions
                  onEdit={() => openEdit(item)}
                  onDelete={() => {
                    if (window.confirm("Xóa kinh nghiệm này?")) {
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

      <ExperienceFormModal
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
