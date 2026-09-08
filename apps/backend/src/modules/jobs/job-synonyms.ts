/**
 * Bảng từ điển đồng nghĩa (Việt - Anh và các cách viết phổ biến)
 * dành cho lĩnh vực việc làm / IT / tuyển dụng.
 */
export const SYNONYM_GROUPS: string[][] = [
  // Thực tập sinh / Intern
  [
    "thực tập sinh",
    "thuc tap sinh",
    "thực tập",
    "thuc tap",
    "intern",
    "internship",
    "trainee",
    "tts",
  ],

  // Mới tốt nghiệp / Fresher
  [
    "fresher",
    "mới tốt nghiệp",
    "moi tot nghiep",
    "sinh viên mới ra trường",
    "entry level",
    "junior fresher",
  ],

  // Lập trình viên / Developer / Kỹ sư phần mềm
  [
    "lập trình viên",
    "lap trinh vien",
    "developer",
    "software engineer",
    "kỹ sư phần mềm",
    "ky su phan mem",
    "programmer",
    "dev",
    "coder",
  ],

  // Frontend
  ["frontend", "front-end", "front end", "fe developer", "fe"],

  // Backend
  ["backend", "back-end", "back end", "be developer", "be"],

  // Fullstack
  ["fullstack", "full-stack", "full stack", "fullstack developer"],

  // DevOps / Sysadmin / Cloud
  [
    "devops",
    "sysadmin",
    "system admin",
    "quản trị hệ thống",
    "cloud engineer",
    "sre",
    "site reliability",
  ],

  // Kiểm thử / Tester / QA / QC
  [
    "kiểm thử",
    "kiem thu",
    "kiểm thử viên",
    "tester",
    "qa",
    "qc",
    "quality assurance",
    "software tester",
  ],

  // Mobile
  [
    "mobile",
    "di động",
    "ios developer",
    "android developer",
    "flutter",
    "react native",
  ],

  // Thiết kế / UI / UX / Designer
  [
    "ui/ux",
    "ui ux",
    "ux/ui",
    "designer",
    "thiết kế",
    "thiet ke",
    "product designer",
    "graphic designer",
    "ui designer",
  ],

  // Quản lý sản phẩm / Product Manager
  [
    "product manager",
    "quản lý sản phẩm",
    "quan ly san pham",
    "product owner",
    "po",
    "pm",
  ],

  // Quản lý dự án / Project Manager
  [
    "project manager",
    "quản lý dự án",
    "quan ly du an",
    "scrum master",
  ],

  // Phân tích nghiệp vụ / Business Analyst
  [
    "business analyst",
    "phân tích nghiệp vụ",
    "phan tich nghiep vu",
    "ba",
  ],

  // Dữ liệu / Data
  [
    "data analyst",
    "data scientist",
    "data engineer",
    "phân tích dữ liệu",
    "phan tich du lieu",
  ],

  // Nhân sự / Tuyển dụng / HR
  [
    "nhân sự",
    "nhan su",
    "tuyển dụng",
    "tuyen dung",
    "hr",
    "recruiter",
    "talent acquisition",
    "human resources",
  ],

  // Kinh doanh / Sales
  [
    "nhân viên kinh doanh",
    "nhan vien kinh doanh",
    "kinh doanh",
    "bán hàng",
    "ban hang",
    "sales",
    "sale",
    "account executive",
  ],

  // Tiếp thị / Marketing
  [
    "marketing",
    "tiếp thị",
    "tiep thi",
    "digital marketing",
    "content creator",
    "seo",
  ],

  // Kế toán / Accountant
  [
    "kế toán",
    "ke toan",
    "accountant",
    "accounting",
    "kiểm toán",
  ],
];

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Mở rộng từ khóa tìm kiếm dựa vào bảng từ đồng nghĩa (Việt - Anh).
 * Ví dụ: "thực tập sinh" -> ["thực tập sinh", "intern", "internship", "trainee", "thực tập", "tts"]
 *        "thực tập sinh react" -> ["thực tập sinh react", "intern react", "react intern", "intern", ...]
 */
export function expandSearchKeywords(input: string): string[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return [];

  const results = new Set<string>([trimmed]);

  // 1. So khớp chính xác cả cụm từ
  for (const group of SYNONYM_GROUPS) {
    const hasExact = group.some((term) => term.toLowerCase() === trimmed);
    if (hasExact) {
      for (const term of group) {
        results.add(term.toLowerCase());
      }
    }
  }

  // 2. So khớp từng phần từ đồng nghĩa trong cụm từ dài (ví dụ: "thực tập sinh react", "react intern")
  for (const group of SYNONYM_GROUPS) {
    for (const term of group) {
      const lowerTerm = term.toLowerCase();
      const termRegex = new RegExp(`(^|\\s)${escapeRegExp(lowerTerm)}(?=\\s|$)`, "i");
      if (termRegex.test(trimmed)) {
        for (const replacement of group) {
          if (replacement.toLowerCase() !== lowerTerm) {
            const replaced = trimmed.replace(termRegex, `$1${replacement}`).trim();
            if (replaced) results.add(replaced.toLowerCase());
          }
          // Thêm cả từ khóa đồng nghĩa độc lập
          results.add(replacement.toLowerCase());
        }
      }
    }
  }

  return Array.from(results).slice(0, 10);
}
