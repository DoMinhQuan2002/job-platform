"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { formatDateTime } from "../lib/format";
import type { CandidateProfile } from "../types";
import { ProfileCard } from "./profile-card";
import { SectionHeader } from "./section-header";

type IntroSectionProps = {
  profile: CandidateProfile;
  saving: boolean;
  onSave: (input: { bio: string | null; careerObjective: string | null }) => Promise<void>;
};

export function IntroSection({ profile, saving, onSave }: IntroSectionProps) {
  const [bio, setBio] = useState(profile.bio ?? "");
  const [careerObjective, setCareerObjective] = useState(profile.careerObjective ?? "");
  const [editingBio, setEditingBio] = useState(false);
  const [editingObjective, setEditingObjective] = useState(false);

  useEffect(() => {
    setBio(profile.bio ?? "");
    setCareerObjective(profile.careerObjective ?? "");
  }, [profile.bio, profile.careerObjective]);

  const handleSave = async () => {
    await onSave({
      bio: bio.trim() || null,
      careerObjective: careerObjective.trim() || null,
    });
    setEditingBio(false);
    setEditingObjective(false);
  };

  return (
    <ProfileCard className="space-y-6">
      <SectionHeader
        title="Giới thiệu bản thân & Mục tiêu nghề nghiệp"
        action={
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        }
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Giới thiệu bản thân</h3>
            <button
              type="button"
              className="rounded-md p-1.5 text-primary transition hover:bg-primary/5 hover:text-primary/80"
              onClick={() => setEditingBio((value) => !value)}
              aria-label="Chỉnh sửa giới thiệu"
            >
              <Pencil className="size-4" />
            </button>
          </div>
          {editingBio ? (
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-[#f9f9ff] px-3 py-2 text-sm text-muted outline-none focus:border-primary"
              placeholder="Viết vài dòng về bản thân..."
            />
          ) : (
            <p className="min-h-[120px] whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {bio || "Chưa có giới thiệu. Nhấn biểu tượng bút để thêm."}
            </p>
          )}
          <p className="text-xs font-semibold text-[#737686]">
            Cập nhật lần cuối: {formatDateTime(profile.updatedAt)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Mục tiêu nghề nghiệp</h3>
            <button
              type="button"
              className="rounded-md p-1.5 text-primary transition hover:bg-primary/5 hover:text-primary/80"
              onClick={() => setEditingObjective((value) => !value)}
              aria-label="Chỉnh sửa mục tiêu"
            >
              <Pencil className="size-4" />
            </button>
          </div>
          {editingObjective ? (
            <textarea
              value={careerObjective}
              onChange={(event) => setCareerObjective(event.target.value)}
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-[#f9f9ff] px-3 py-2 text-sm text-muted outline-none focus:border-primary"
              placeholder="Mô tả mục tiêu nghề nghiệp..."
            />
          ) : (
            <p className="min-h-[120px] whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {careerObjective || "Chưa có mục tiêu. Nhấn biểu tượng bút để thêm."}
            </p>
          )}
          <p className="text-xs font-semibold text-[#737686]">
            Cập nhật lần cuối: {formatDateTime(profile.updatedAt)}
          </p>
        </div>
      </div>
    </ProfileCard>
  );
}
