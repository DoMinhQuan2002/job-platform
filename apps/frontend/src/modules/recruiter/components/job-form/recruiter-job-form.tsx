"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bold, Eye, Italic, Link2, List, LoaderCircle, Plus, RefreshCw, Underline, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  recruiterJobsApi,
  type JobCategoryOption,
  type RecruiterJobInput,
  type SkillOption,
} from "@/services/recruiter-jobs.service";
import { useRecruiterCompany } from "../recruiter-company-context";
import { JobFormSkeleton } from "./job-form-skeleton";
import { JobPreviewCard } from "./job-preview-card";
import { emptyJobFormValues, jobFormSchema, type JobFormValues } from "./job-form-schema";

type RecruiterJobFormProps = { mode: "create" | "edit"; jobId?: string };

const inputClass = "h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-xs font-semibold text-text";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-[10px] text-danger">{message}</p> : null;
}

function TextAreaField({ label, required, placeholder, maxLength, error, registration }: { label: string; required?: boolean; placeholder: string; maxLength: number; error?: string; registration: UseFormRegisterReturn }) {
  return <div><label className={labelClass}>{label} {required && <span className="text-danger">*</span>}</label><div className="overflow-hidden rounded-lg border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"><div className="flex h-9 items-center gap-3 border-b border-border bg-background px-3 text-muted"><Bold className="size-3.5" /><Italic className="size-3.5" /><Underline className="size-3.5" /><List className="size-3.5" /><Link2 className="size-3.5" /></div><textarea {...registration} maxLength={maxLength} placeholder={placeholder} className="h-32 w-full resize-none bg-transparent p-3 text-xs leading-relaxed text-text outline-none placeholder:text-muted/70" /></div><FieldError message={error} /></div>;
}

export function RecruiterJobForm({ mode, jobId }: RecruiterJobFormProps) {
  const router = useRouter();
  const {
    company,
    loading: companyLoading,
    error: companyError,
    reload: reloadCompany,
  } = useRecruiterCompany();
  const [categories, setCategories] = useState<JobCategoryOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: emptyJobFormValues,
  });
  const values = watch();
  const selectedSkills = values.skills ?? [];

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    const requests = [
      recruiterJobsApi.listCategories(controller.signal),
      recruiterJobsApi.listSkills(controller.signal),
    ] as const;

    Promise.all(requests)
      .then(async ([categoryResponse, skillResponse]) => {
        if (ignore) return;
        setCategories(categoryResponse.data);
        setSkills(skillResponse.data.filter((skill) => !skill.status || skill.status === "ACTIVE"));

        if (mode === "edit" && jobId) {
          const detailResponse = await recruiterJobsApi.detail(jobId, controller.signal);
          if (ignore) return;
          const job = detailResponse.data;
          reset({
            title: job.title,
            categoryId: job.category?.id ?? "",
            address: job.address,
            jobType: job.jobType,
            jobMode: job.jobMode,
            experience: job.experience ?? 0,
            quantity: job.quantity ?? 1,
            salaryMin: job.salaryMin === null ? "" : String(job.salaryMin),
            salaryMax: job.salaryMax === null ? "" : String(job.salaryMax),
            isNegotiable: job.isNegotiable,
            deadline: String(job.deadline).slice(0, 10),
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits ?? "",
            skills: job.skills.map((skill) => ({ skillId: skill.id, isRequired: skill.isRequired })),
          });
        }
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu biểu mẫu.");
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; controller.abort(); };
  }, [mode, jobId, reloadKey, reset]);

  const submit = handleSubmit(async (formValues) => {
    if (!company) return;
    const body: RecruiterJobInput = {
      companyId: company.id,
      categoryId: formValues.categoryId,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      requirements: formValues.requirements.trim(),
      benefits: formValues.benefits.trim() || null,
      salaryMin: formValues.isNegotiable || !formValues.salaryMin ? null : Number(formValues.salaryMin),
      salaryMax: formValues.isNegotiable || !formValues.salaryMax ? null : Number(formValues.salaryMax),
      isNegotiable: formValues.isNegotiable,
      address: formValues.address.trim(),
      jobType: formValues.jobType,
      jobMode: formValues.jobMode,
      experience: formValues.experience,
      quantity: formValues.quantity,
      deadline: formValues.deadline,
      skills: formValues.skills,
    };

    try {
      if (mode === "create") {
        const response = await recruiterJobsApi.create(body);
        toast.success("Tạo tin tuyển dụng thành công");
        router.replace(`/recruiter/jobs/${response.data.id}`);
      } else if (jobId) {
        const updateBody = Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== "companyId"),
        ) as Omit<RecruiterJobInput, "companyId">;
        await recruiterJobsApi.update(jobId, updateBody);
        toast.success("Cập nhật tin tuyển dụng thành công");
        router.replace(`/recruiter/jobs/${jobId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu tin tuyển dụng");
    }
  });

  if (loading || companyLoading) return <JobFormSkeleton />;
  if (loadError || companyError || !company) return <div className="mx-auto grid min-h-[400px] max-w-6xl place-items-center"><div className="rounded-lg border border-danger/20 bg-surface p-8 text-center"><p className="text-sm text-danger">{loadError ?? companyError ?? "Không tìm thấy hồ sơ công ty."}</p><button type="button" onClick={() => { setLoading(true); setLoadError(null); setReloadKey((key) => key + 1); reloadCompany(); }} className="mx-auto mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-white"><RefreshCw className="size-4" />Thử lại</button></div></div>;

  const addSkill = (skillId: string) => {
    if (!skillId || selectedSkills.some((skill) => skill.skillId === skillId)) return;
    setValue("skills", [...selectedSkills, { skillId, isRequired: false }], { shouldDirty: true });
  };

  const cancelHref = mode === "edit" && jobId ? `/recruiter/jobs/${jobId}` : "/recruiter/jobs";

  return (
    <div className="-m-4 min-h-[calc(100%+2rem)] bg-white p-4 md:-m-5 md:min-h-[calc(100%+2.5rem)] md:p-5 lg:-m-6 lg:min-h-[calc(100%+3rem)] lg:p-6">
    <form onSubmit={submit} className="mx-auto max-w-6xl pb-20">
      <Link href={cancelHref} className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><ArrowLeft className="size-3.5" />Quay lại</Link>
      <div className="mb-6"><h1 className="text-xl font-bold text-text">{mode === "create" ? "Đăng tin tuyển dụng" : "Chỉnh sửa tin tuyển dụng"}</h1><p className="mt-1 text-xs text-muted">Vui lòng nhập đầy đủ thông tin để tin tuyển dụng được duyệt nhanh chóng.</p></div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className={labelClass}>Tên vị trí tuyển dụng <span className="text-danger">*</span></label><div className="relative"><input {...register("title")} maxLength={255} placeholder="Ví dụ: Chuyên viên Digital Marketing" className={`${inputClass} pr-16`} /><span className="absolute right-3 top-3 text-[10px] text-muted">{values.title?.length ?? 0}/255</span></div><FieldError message={errors.title?.message} /></div>
          <div><label className={labelClass}>Ngành nghề <span className="text-danger">*</span></label><select {...register("categoryId")} className={inputClass}><option value="">Chọn ngành nghề</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><FieldError message={errors.categoryId?.message} /></div>
          <div><label className={labelClass}>Địa điểm <span className="text-danger">*</span></label><input {...register("address")} placeholder="Nhập địa điểm làm việc" className={inputClass} /><FieldError message={errors.address?.message} /></div>
          <div><label className={labelClass}>Hình thức làm việc <span className="text-danger">*</span></label><select {...register("jobType")} className={inputClass}><option value="FULL_TIME">Toàn thời gian</option><option value="PART_TIME">Bán thời gian</option></select></div>
          <div><label className={labelClass}>Loại hình <span className="text-danger">*</span></label><select {...register("jobMode")} className={inputClass}><option value="ONSITE">Tại văn phòng</option><option value="REMOTE">Làm từ xa</option><option value="HYBRID">Linh hoạt</option></select></div>
          <div><label className={labelClass}>Kinh nghiệm yêu cầu <span className="text-danger">*</span></label><select {...register("experience", { valueAsNumber: true })} className={inputClass}>{[0, 1, 2, 3, 4, 5, 7, 10].map((year) => <option key={year} value={year}>{year === 0 ? "Không yêu cầu" : `${year} năm`}</option>)}</select><FieldError message={errors.experience?.message} /></div>
          <div><label className={labelClass}>Số lượng tuyển <span className="text-danger">*</span></label><div className="flex items-center gap-2"><input type="number" min={1} {...register("quantity", { valueAsNumber: true })} className={`${inputClass} w-24`} /><span className="text-xs text-muted">người</span></div><FieldError message={errors.quantity?.message} /></div>

          <div className="sm:col-span-2"><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-semibold text-text">Mức lương (VND)</label><label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" {...register("isNegotiable")} className="size-4 accent-primary" />Lương thỏa thuận</label></div><div className="flex items-center gap-3"><input {...register("salaryMin")} inputMode="numeric" readOnly={values.isNegotiable} placeholder="Tối thiểu" className={`${inputClass} ${values.isNegotiable ? "bg-background opacity-50" : ""}`} /><span className="text-muted">–</span><input {...register("salaryMax")} inputMode="numeric" readOnly={values.isNegotiable} placeholder="Tối đa" className={`${inputClass} ${values.isNegotiable ? "bg-background opacity-50" : ""}`} /></div><FieldError message={errors.salaryMin?.message || errors.salaryMax?.message} /></div>
          <div><label className={labelClass}>Hạn nộp hồ sơ <span className="text-danger">*</span></label><input type="date" {...register("deadline")} className={inputClass} /><FieldError message={errors.deadline?.message} /><p className="mt-1 text-[10px] text-muted">Hạn nộp phải sau ngày hôm nay</p></div>

          <div className="sm:col-span-2"><label className={labelClass}>Kỹ năng yêu cầu</label><div className="mb-2 flex flex-wrap gap-2">{selectedSkills.map((selected) => { const skill = skills.find((item) => item.id === selected.skillId); if (!skill) return null; return <span key={selected.skillId} className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-3 pr-1 text-[10px] text-text">{skill.name}<label className="flex items-center gap-1 border-l border-border pl-2 text-primary"><input type="checkbox" checked={selected.isRequired} onChange={(event) => setValue("skills", selectedSkills.map((item) => item.skillId === selected.skillId ? { ...item, isRequired: event.target.checked } : item), { shouldDirty: true })} className="size-3 accent-primary" />Bắt buộc</label><button type="button" onClick={() => setValue("skills", selectedSkills.filter((item) => item.skillId !== selected.skillId), { shouldDirty: true })} className="rounded-full p-1 text-muted hover:bg-border/50"><X className="size-3" /></button></span>; })}</div><div className="relative inline-flex"><Plus className="pointer-events-none absolute left-2 top-2 size-3.5 text-primary" /><select value="" onChange={(event) => addSkill(event.target.value)} className="h-8 rounded-full border border-dashed border-primary bg-surface pl-7 pr-3 text-[10px] font-medium text-primary outline-none"><option value="">Thêm kỹ năng</option>{skills.filter((skill) => !selectedSkills.some((selected) => selected.skillId === skill.id)).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div></div>

          <TextAreaField label="Mô tả công việc" required placeholder="Nhập mô tả công việc..." maxLength={5000} registration={register("description")} error={errors.description?.message} />
          <TextAreaField label="Yêu cầu ứng viên" required placeholder="Nhập yêu cầu ứng viên..." maxLength={5000} registration={register("requirements")} error={errors.requirements?.message} />
          <div className="sm:col-span-2"><TextAreaField label="Quyền lợi / phúc lợi" placeholder="Nhập quyền lợi / phúc lợi..." maxLength={3000} registration={register("benefits")} error={errors.benefits?.message} /></div>
        </div>

        <JobPreviewCard values={values} companyName={company.name} categories={categories} skills={skills} />
      </div>

      <div className="fixed bottom-0 right-0 z-30 flex w-full justify-end gap-3 border-t border-border bg-surface/95 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur lg:w-[calc(100%-16rem)]"><Link href={cancelHref} className="rounded-lg border border-border px-5 py-2 text-xs font-medium text-text hover:bg-background">Hủy</Link><button type="button" onClick={() => document.getElementById("job-preview")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="flex items-center gap-2 rounded-lg border border-primary px-5 py-2 text-xs font-medium text-primary hover:bg-primary/5"><Eye className="size-4" />Xem trước</button><button type="submit" disabled={isSubmitting} className="flex min-w-28 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60">{isSubmitting && <LoaderCircle className="size-4 animate-spin" />}{mode === "create" ? "Gửi duyệt" : "Lưu thay đổi"}</button></div>
    </form>
    </div>
  );
}
