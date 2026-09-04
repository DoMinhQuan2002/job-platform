/**
 * Chuyển đổi đường dẫn avatar (đường dẫn Supabase Storage hoặc URL) thành URL công khai hoàn chỉnh.
 */
export function getAvatarUrl(avatar?: string | null): string | null {
  if (!avatar || typeof avatar !== "string") return null;
  const trimmed = avatar.trim();
  if (!trimmed) return null;

  // Nếu đã là link đầy đủ http/https
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://zcgrjwbmzghvjtpocxkx.supabase.co";
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
    "job-platform-assets";

  // Chuẩn hóa đường dẫn (bỏ dấu / ở đầu nếu có)
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
