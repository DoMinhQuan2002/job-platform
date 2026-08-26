"use client";

import { Megaphone, BarChart3, GraduationCap } from "lucide-react";

export interface TemplateSuggestion {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultContent: string;
  icon: "megaphone" | "chart" | "graduation";
}

export const SUGGESTED_TEMPLATES: TemplateSuggestion[] = [
  {
    id: "sug-marketing",
    title: "Marketing",
    category: "Marketing",
    description: "Phù hợp cho các vị trí Marketing, Truyền thông, Content, Digital Marketing...",
    defaultContent:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi viết đơn này để bày tỏ sự quan tâm đặc biệt tới vị trí Marketing tại Quý công ty. Với hơn 2 năm kinh nghiệm trong lĩnh vực Digital Marketing, xây dựng nội dung đa kênh và tối ưu hóa chuyển đổi, tôi tin rằng năng lực của mình sẽ đóng góp tích cực vào mục tiêu tăng trưởng của công ty...",
    icon: "megaphone",
  },
  {
    id: "sug-sales",
    title: "Kinh doanh",
    category: "Kinh doanh",
    description: "Phù hợp cho các vị trí Sales, Business Development, Account Manager...",
    defaultContent:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi rất hào hứng được ứng tuyển vào vị trí Chuyên viên Kinh doanh / Sales tại Quý công ty. Với thế mạnh về kỹ năng giao tiếp, đàm phán, tìm kiếm khách hàng tiềm năng và vượt chỉ tiêu doanh số liên tục trong các quý vừa qua...",
    icon: "chart",
  },
  {
    id: "sug-intern",
    title: "Thực tập sinh",
    category: "Thực tập sinh",
    description: "Phù hợp cho sinh viên, fresher ứng tuyển vị trí thực tập, mới tốt nghiệp...",
    defaultContent:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi là sinh viên năm cuối chuyên ngành Công nghệ thông tin / Kinh tế. Với tinh thần ham học hỏi, chủ động và nền tảng kiến thức vững vàng, tôi mong muốn có cơ hội được thực tập và cống hiến tại môi trường làm việc chuyên nghiệp của Quý công ty...",
    icon: "graduation",
  },
];

interface SuggestedTemplatesProps {
  onUseTemplate: (template: TemplateSuggestion) => void;
}

export function SuggestedTemplates({ onUseTemplate }: SuggestedTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Mẫu đơn gợi ý</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Một số mẫu đơn ứng tuyển chuyên nghiệp bạn có thể tham khảo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUGGESTED_TEMPLATES.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition"
            >
              <div>
                {/* Icon category */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl">
                  {item.icon === "megaphone" && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                      <Megaphone className="h-6 w-6" />
                    </div>
                  )}
                  {item.icon === "chart" && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  )}
                  {item.icon === "graduation" && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <h4 className="mt-4 font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {item.description}
                </p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onUseTemplate(item)}
                  className="w-full rounded-xl border border-primary/40 bg-white py-2 text-xs font-semibold text-primary transition hover:bg-blue-50"
                >
                  Sử dụng mẫu
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
