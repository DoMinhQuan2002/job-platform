/**
 * Chuyển đổi chuỗi tiếng Việt hoặc bất kỳ chuỗi văn bản nào thành slug chuẩn SEO (kebab-case)
 * @param text Chuỗi đầu vào (ví dụ: "Công ty Cổ phần Công nghệ FPT")
 * @returns Chuỗi slug (ví dụ: "cong-ty-co-phan-cong-nghe-fpt")
 */
export function slugify(text: string): string {
  if (!text) return "company";

  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
    .replace(/-+/g, "-"); // Xóa các dấu - liên tiếp

  return slug || "company";
}
