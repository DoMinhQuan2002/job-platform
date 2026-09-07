import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_STORAGE_BASE =
  "https://zcgrjwbmzghvjtpocxkx.supabase.co/storage/v1/object/public/job-platform-assets";

export function resolveStorageUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return undefined;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  return `${SUPABASE_STORAGE_BASE}/${clean}`;
}

export async function downloadFileFromUrl(url: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Không thể tải file");
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    if (fileName) {
      link.download = fileName;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    if (fileName) {
      link.download = fileName;
    }
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
