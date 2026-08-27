import { BriefcaseBusiness, CalendarDays, ImageIcon, MapPin, Tag } from "lucide-react";
import type { JobCategoryOption, SkillOption } from "@/services/recruiter-jobs.service";
import type { JobFormValues } from "./job-form-schema";

type JobPreviewCardProps = {
  values: JobFormValues;
  companyName: string;
  categories: JobCategoryOption[];
  skills: SkillOption[];
};

const jobTypeLabels = { FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian" };
const jobModeLabels = { ONSITE: "Tại văn phòng", REMOTE: "Làm từ xa", HYBRID: "Linh hoạt" };

export function JobPreviewCard({ values, companyName, categories, skills }: JobPreviewCardProps) {
  const selectedSkills = values.skills
    .map((selected) => skills.find((skill) => skill.id === selected.skillId))
    .filter((skill): skill is SkillOption => Boolean(skill));
  const category = categories.find((item) => item.id === values.categoryId);
  const salary = values.isNegotiable
    ? "Thỏa thuận"
    : values.salaryMin || values.salaryMax
      ? `${values.salaryMin || "0"} - ${values.salaryMax || "..."} VND`
      : "Chưa cập nhật";

  return (
    <aside id="job-preview" className="scroll-mt-4 space-y-5 lg:sticky lg:top-4">
      <section className="rounded-lg border border-primary/15 bg-primary/5 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text"><CalendarDays className="size-4 text-primary" />Lưu ý khi đăng tin</h2>
        <ul className="list-inside list-disc space-y-2 text-[11px] leading-relaxed text-muted"><li>Các trường có dấu * là bắt buộc.</li><li>Hạn nộp hồ sơ phải sau ngày hôm nay.</li><li>Tin mới sẽ ở trạng thái “Chờ duyệt”.</li><li>Sau khi duyệt, tin có thể được mở để nhận hồ sơ.</li></ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text">Xem trước tin đăng</h2>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="mb-4 grid h-36 place-items-center rounded-md bg-background text-border"><ImageIcon className="size-9" /></div>
          <h3 className="line-clamp-2 text-base font-bold text-text">{values.title || "Tên vị trí tuyển dụng"}</h3>
          <p className="mt-1 text-xs text-muted">{companyName}</p>
          <div className="mt-4 space-y-2 text-[11px] text-muted">
            <p className="flex items-center gap-2"><MapPin className="size-3.5" />{values.address || "Địa điểm"}</p>
            <div className="flex flex-wrap gap-3"><p className="flex items-center gap-2"><BriefcaseBusiness className="size-3.5" />{jobTypeLabels[values.jobType]}</p><p className="flex items-center gap-2"><Tag className="size-3.5" />{jobModeLabels[values.jobMode]}</p></div>
          </div>
          <div className="my-4 border-t border-border pt-3"><p className="mb-1 text-xs font-semibold text-text">Mô tả ngắn</p><p className="line-clamp-3 text-[11px] leading-relaxed text-muted">{values.description || "Mô tả công việc sẽ hiển thị tại đây sau khi bạn nhập thông tin."}</p></div>
          <div className="mb-4 flex flex-wrap gap-1.5">{selectedSkills.slice(0, 3).map((skill) => <span key={skill.id} className="rounded bg-primary/10 px-2 py-1 text-[9px] text-primary">{skill.name}</span>)}{selectedSkills.length > 3 && <span className="rounded bg-background px-2 py-1 text-[9px] text-muted">+{selectedSkills.length - 3}</span>}</div>
          <div className="space-y-1 border-t border-border pt-3 text-[10px] text-muted"><p>Ngành nghề: {category?.name ?? "Chưa chọn"}</p><div className="flex justify-between gap-2"><span>Hạn nộp: {values.deadline || "dd/mm/yyyy"}</span><strong className="text-text">Lương: {salary}</strong></div></div>
        </div>
      </section>
    </aside>
  );
}
