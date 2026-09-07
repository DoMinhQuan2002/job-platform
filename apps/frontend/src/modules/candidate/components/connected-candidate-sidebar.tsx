"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { candidateApi } from "../api";
import { getStoredUser, setStoredUser } from "@/lib/auth-token";
import { useCandidateSidebarData } from "../hooks/use-candidate-sidebar-data";
import type { CandidateProfile } from "../types";
import { CandidateSidebar } from "./candidate-sidebar";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ConnectedCandidateSidebarProps = {
  /** Truyền từ page đã có data (vd. profile) để tránh fetch trùng */
  profile?: CandidateProfile | null;
  displayName?: string;
  avatarUrl?: string | null;
  /** Đồng bộ avatar lên page (vd. cập nhật state account) */
  onAvatarUpdated?: (avatarUrl: string | null) => void;
};

function validateAvatarFile(file: File): string | null {
  if (!AVATAR_MIME.has(file.type)) {
    return "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Ảnh không được vượt quá 5MB";
  }
  return null;
}

/**
 * Sidebar ứng viên dùng chung: profile, resume, applications, saved-jobs, ...
 * Không truyền `profile` → tự gọi GET /candidates/me + GET /users/me.
 * Avatar: POST/DELETE /users/me/avatar (G1).
 */
export function ConnectedCandidateSidebar({
  profile: profileProp,
  displayName: displayNameProp,
  avatarUrl: avatarUrlProp,
  onAvatarUpdated,
}: ConnectedCandidateSidebarProps = {}) {
  const shouldFetch = profileProp === undefined;
  const { profile, account, loading } = useCandidateSidebarData(shouldFetch);
  const [localAvatar, setLocalAvatar] = useState<string | null | undefined>(undefined);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const resolvedAvatar =
    localAvatar !== undefined
      ? localAvatar
      : (avatarUrlProp ?? account?.avatar ?? null);

  useEffect(() => {
    setLocalAvatar(undefined);
  }, [avatarUrlProp, account?.avatar]);

  const applyAvatar = (url: string | null) => {
    setLocalAvatar(url);
    onAvatarUpdated?.(url);
    const stored = getStoredUser();
    if (stored) {
      setStoredUser({
        ...stored,
        avatar: url,
      });
    }
  };

  const handleAvatarSelect = async (file: File) => {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setAvatarUploading(true);
    try {
      const response = await candidateApi.uploadAvatar(file);
      applyAvatar(response.data.avatar);
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật ảnh đại diện",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    try {
      await candidateApi.deleteAvatar();
      applyAvatar(null);
      toast.success("Đã xóa ảnh đại diện");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa ảnh đại diện",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  if (shouldFetch && loading) {
    return (
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-80 rounded-xl" />
      </aside>
    );
  }

  return (
    <CandidateSidebar
      profile={profileProp ?? profile}
      displayName={displayNameProp ?? account?.fullName ?? "Ứng viên"}
      avatarUrl={resolvedAvatar}
      avatarUploading={avatarUploading}
      onAvatarSelect={(file) => void handleAvatarSelect(file)}
      onAvatarRemove={() => void handleAvatarRemove()}
    />
  );
}
