"use client";

import {
  Award,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Info,
  LoaderCircle,
  Mail,
  MapPin,
  Megaphone,
  PenLine,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { companiesApi1 } from "../api";
import type { Company, CompanyProfileInput, CompanySize } from "../types";

type CompanyFormErrors = Partial<Record<keyof CompanyProfileInput, string>>;

const emptyForm: CompanyProfileInput = {
  name: "",
  logo: "",
  website: "",
  email: "",
  phone: "",
  taxCode: "",
  companySize: "",
  address: "",
  description: "",
};

const companySizeOptions: Array<{ value: CompanySize; label: string }> = [
  { value: "1-50", label: "1 - 50 nhân sự" },
  { value: "50-100", label: "50 - 100 nhân sự" },
  { value: "100-500", label: "100 - 500 nhân sự" },
  { value: "500+", label: "Trên 500 nhân sự" },
];

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Tăng độ tin cậy",
    description: "Ứng viên tin tưởng hơn khi hồ sơ có thông tin rõ ràng.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Megaphone,
    title: "Thu hút ứng viên chất lượng",
    description: "Giới thiệu doanh nghiệp giúp tìm đúng ứng viên phù hợp.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: BriefcaseBusiness,
    title: "Quản lý dễ dàng",
    description: "Quản lý tin tuyển dụng và hồ sơ liên quan hiệu quả hơn.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Star,
    title: "Xây dựng thương hiệu",
    description: "Tạo dấu ấn thương hiệu trên thị trường tuyển dụng.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

function normalizePayload(form: CompanyProfileInput): CompanyProfileInput {
  const optionalText = (value?: string | null) => {
    const trimmed = value?.trim() ?? "";
    return trimmed ? trimmed : null;
  };

  return {
    name: form.name.trim(),
    logo: optionalText(form.logo),
    website: optionalText(form.website),
    email: form.email.trim(),
    phone: form.phone.trim(),
    taxCode: form.taxCode.trim(),
    companySize: form.companySize || null,
    address: form.address.trim(),
    description: optionalText(form.description),
  };
}

function formFromCompany(company: Company): CompanyProfileInput {
  return {
    name: company.name || "",
    logo: company.logo || "",
    website: company.website || "",
    email: company.email || "",
    phone: company.phone || "",
    taxCode: company.taxCode || "",
    companySize: (company.companySize as CompanySize | "") || "",
    address: company.address || "",
    description: company.description || "",
  };
}

function validateCompanyForm(form: CompanyProfileInput) {
  const errors: CompanyFormErrors = {};
  if (!form.name.trim()) errors.name = "Vui lòng nhập tên công ty";
  if (!form.email.trim()) errors.email = "Vui lòng nhập email công ty";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email không đúng định dạng";
  }
  if (!form.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
  else if (!/^(0|\+84)[0-9]{9,10}$/.test(form.phone.trim())) {
    errors.phone = "Số điện thoại VN không hợp lệ";
  }
  if (!form.taxCode.trim()) errors.taxCode = "Vui lòng nhập mã số thuế";
  if (!form.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
  if (!form.companySize) errors.companySize = "Vui lòng chọn quy mô công ty";
  if (!form.description?.trim()) errors.description = "Vui lòng nhập giới thiệu công ty";
  if (form.website?.trim() && !/^https?:\/\/.+\..+/.test(form.website.trim())) {
    errors.website = "Website cần bắt đầu bằng http:// hoặc https://";
  }
  return errors;
}

function getStatusLabel(status?: string) {
  if (status === "ACTIVE") return "Đã xác thực";
  if (status === "REJECTED") return "Cần bổ sung";
  if (status === "BLOCKED") return "Tạm khóa";
  return "Chờ xác thực";
}

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState<CompanyProfileInput>(emptyForm);
  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  const resolveLogoUrl = useCallback(async (logo?: string | null) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
      return logo;
    }
    try {
      const response = await companiesApi1.getLogoAccessUrl(logo);
      return response.data.url;
    } catch {
      return "";
    }
  }, []);

  const loadMyCompany = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setLoading(true);
    setLoadError("");
    try {
      const response = await companiesApi1.getMine(signal);
      if (signal?.aborted) return;
      const logoUrl = await resolveLogoUrl(response.data.logo);
      if (signal?.aborted) return;
      setCompany(response.data);
      setForm(formFromCompany(response.data));
      setLogoPreviewUrl(logoUrl);
    } catch (error) {
      if (signal?.aborted) return;
      if (error instanceof ApiError && error.statusCode === 404) {
        setCompany(null);
        setForm(emptyForm);
        setLogoPreviewUrl("");
        setFormVisible(false);
        return;
      }
      setLoadError(error instanceof Error ? error.message : "Không thể tải thông tin công ty.");
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [resolveLogoUrl]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void loadMyCompany(controller.signal);
    });
    return () => controller.abort();
  }, [loadMyCompany]);

  const openCreateForm = () => {
    setForm(company ? formFromCompany(company) : emptyForm);
    setErrors({});
    setFormVisible(true);
    void resolveLogoUrl(company?.logo).then(setLogoPreviewUrl);
  };

  const updateForm = (key: keyof CompanyProfileInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submitForm = async () => {
    const nextErrors = validateCompanyForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = normalizePayload(form);
      const response = company
        ? await companiesApi1.updateMine(payload)
        : await companiesApi1.create(payload);
      setCompany(response.data);
      setForm(formFromCompany(response.data));
      setLogoPreviewUrl(await resolveLogoUrl(response.data.logo));
      setFormVisible(false);
      toast.success(company ? "Đã cập nhật thông tin công ty." : "Đã tạo hồ sơ công ty. Hồ sơ đang chờ xác thực.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu thông tin công ty.");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!LOGO_MIME_TYPES.includes(file.type)) {
      toast.error("Logo chỉ hỗ trợ JPG, PNG, WebP hoặc SVG.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo không được vượt quá 2MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const response = await companiesApi1.uploadLogo(file);
      setForm((current) => ({ ...current, logo: response.data.storagePath }));
      setLogoPreviewUrl(response.data.url || "");
      toast.success("Đã tải logo lên.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải logo lên.");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-950">
      <section>
            <p className="text-xs font-semibold text-primary">Thông tin công ty</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Quản lý công ty</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Cập nhật thông tin công ty của bạn để ứng viên hiểu rõ hơn về doanh nghiệp.
            </p>
      </section>

      <section
            className={cn(
              "grid gap-5",
              company && !formVisible && "xl:grid-cols-[minmax(0,1fr)_320px]",
            )}
      >
            <div className="space-y-5">
              {loading ? (
                <Panel className="grid min-h-[420px] place-items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <LoaderCircle className="size-4 animate-spin" />
                    Đang tải thông tin công ty...
                  </div>
                </Panel>
              ) : loadError ? (
                <Panel className="grid min-h-[320px] place-items-center text-center">
                  <div>
                    <p className="font-semibold text-slate-950">Không thể tải dữ liệu</p>
                    <p className="mt-2 text-sm text-slate-600">{loadError}</p>
                    <Button className="mt-4" onClick={() => void loadMyCompany()}>
                      Thử lại
                    </Button>
                  </div>
                </Panel>
              ) : formVisible ? (
                <CompanyInlineForm
                  saving={saving}
                  mode={company ? "edit" : "create"}
                  form={form}
                  errors={errors}
                  logoPreviewUrl={logoPreviewUrl}
                  uploadingLogo={uploadingLogo}
                  onCancel={() => setFormVisible(false)}
                  onSubmit={submitForm}
                  onChange={updateForm}
                  onUploadLogo={uploadLogo}
                />
              ) : company ? (
                <CompanySummary company={company} logoUrl={logoPreviewUrl} onEdit={openCreateForm} />
              ) : (
                <EmptyCompanyState onCreate={openCreateForm} />
              )}

              {!company && !formVisible ? <WhyCompanyMatters /> : null}
              {company && !formVisible ? <CompanyNextSteps company={company} /> : null}
            </div>

            {company && !formVisible ? <CompanyGuidanceAside /> : null}
      </section>
    </div>
  );
}
function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </section>
  );
}

function EmptyCompanyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Panel className="min-h-[430px] px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative grid size-40 place-items-center rounded-full bg-[#f1f5ff]">
          <Building2 className="size-20 text-slate-700" strokeWidth={1.4} />
          <span className="absolute bottom-8 right-14 grid size-9 place-items-center rounded-full border-2 border-white bg-primary text-white">
            <Plus className="size-5" />
          </span>
        </div>
        <h2 className="mt-7 text-lg font-bold text-slate-950">Bạn chưa có thông tin công ty</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Hãy thêm thông tin công ty của bạn để bắt đầu đăng tin tuyển dụng và thu hút ứng viên phù hợp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="h-10 bg-primary px-5 text-white hover:bg-primary/90" onClick={onCreate}>
            <Plus className="size-4" />
            Tạo công ty
          </Button>
          <Button variant="outline" className="h-10 border-slate-300 bg-white px-5 text-slate-800">
            <Info className="size-4" />
            Tìm hiểu thêm
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function CompanySummary({
  company,
  logoUrl,
  onEdit,
}: {
  company: Company;
  logoUrl: string;
  onEdit: () => void;
}) {
  const facts = [
    { icon: Mail, label: "Email", value: company.email },
    { icon: Phone, label: "Điện thoại", value: company.phone },
    { icon: MapPin, label: "Địa chỉ", value: company.address },
    { icon: UsersRound, label: "Quy mô", value: company.companySize ? `${company.companySize} nhân sự` : "Chưa cập nhật" },
  ];

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-200 bg-[#f8faff] px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-xl font-bold text-primary">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={company.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full rounded-lg object-contain p-2"
                />
              ) : (
                company.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950">{company.name}</h2>
              <p className="mt-1 text-sm font-medium text-amber-600">{getStatusLabel(company.status)}</p>
            </div>
          </div>
          <Button className="h-10 px-4" onClick={onEdit}>
            <PenLine className="size-4" />
            Cập nhật
          </Button>
        </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex min-w-0 gap-3 rounded-lg border border-slate-200 p-4">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value || "Chưa cập nhật"}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 pb-6">
        <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {company.description || "Thông tin giới thiệu công ty đang được cập nhật."}
        </p>
      </div>
    </Panel>
  );
}

function WhyCompanyMatters() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700">
          <Award className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-amber-950">Bạn chưa có thông tin công ty</h2>
          <p className="mt-1 text-sm text-amber-800">
            Hồ sơ đầy đủ giúp tin tuyển dụng nổi bật hơn trong mắt ứng viên và quản trị viên.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description, color, bg }) => (
          <div key={title} className="min-w-0">
            <span className={cn("grid size-8 place-items-center rounded-full", bg, color)}>
              <Icon className="size-4" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompanyNextSteps({ company }: { company: Company }) {
  const isActive = company.status === "ACTIVE";

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-emerald-950">
            {isActive ? "Hồ sơ công ty đã sẵn sàng" : "Hồ sơ công ty đang chờ duyệt"}
          </h2>
          <p className="mt-1 text-sm text-emerald-800">
            {isActive
              ? "Bạn có thể bắt đầu đăng tin và quản lý ứng viên cho công ty."
              : "Admin sẽ kiểm tra thông tin trước khi hồ sơ được hiển thị công khai."}
          </p>
        </div>
      </div>
    </section>
  );
}

function CompanyGuidanceAside() {
  return (
    <aside className="space-y-5">
      <InlineInfoCard
        icon={<Info className="size-4" />}
        title="Thông tin công ty"
        description="Thông tin công ty sẽ được hiển thị công khai với ứng viên trong quá trình ứng tuyển."
      />
      <InlineInfoCard
        icon={<ShieldCheck className="size-4" />}
        title="Bảo mật thông tin"
        description="Vui lòng cung cấp thông tin chính xác. Thông tin được bảo mật và chỉ hiển thị cho ứng viên khi cần thiết."
      />
      <InlineInfoCard
        icon={<CircleHelp className="size-4" />}
        title="Bạn cần hỗ trợ?"
        description="Nếu bạn cần hỗ trợ cập nhật thông tin, vui lòng liên hệ với chúng tôi."
        action
      />
    </aside>
  );
}

function CompanyInlineForm({
  saving,
  mode,
  form,
  errors,
  logoPreviewUrl,
  uploadingLogo,
  onCancel,
  onSubmit,
  onChange,
  onUploadLogo,
}: {
  saving: boolean;
  mode: "create" | "edit";
  form: CompanyProfileInput;
  errors: CompanyFormErrors;
  logoPreviewUrl: string;
  uploadingLogo: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onChange: (key: keyof CompanyProfileInput, value: string) => void;
  onUploadLogo: (file: File) => Promise<void>;
}) {
  const nameCount = form.name.length;
  const descriptionCount = form.description?.length ?? 0;

  return (
    <section aria-labelledby="company-form-title">
      <div className="mb-4 border-b border-slate-200">
        <div className="flex gap-8">
          <button type="button" className="border-b-2 border-primary px-1 pb-3 text-sm font-bold text-primary">
            Thông tin công ty
          </button>
          <button type="button" className="px-1 pb-3 text-sm font-semibold text-slate-500">
            Thành viên công ty
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(); }} noValidate>
            <Field label="Logo công ty" htmlFor="company-logo">
              <label
                htmlFor="company-logo"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-white px-4 py-6 text-center transition hover:border-primary"
              >
                {logoPreviewUrl ? (
                  <Image
                    src={logoPreviewUrl}
                    alt="Logo công ty"
                    width={88}
                    height={88}
                    unoptimized
                    className="size-[88px] rounded-lg object-contain"
                  />
                ) : uploadingLogo ? (
                  <LoaderCircle className="size-8 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="size-8 text-primary" />
                )}
                <span className="mt-3 text-sm font-bold text-primary">
                  {uploadingLogo ? "Đang tải logo..." : logoPreviewUrl ? "Thay logo mới" : "Tải lên logo mới"}
                </span>
                <span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP hoặc SVG tối đa 2MB</span>
                <input
                  id="company-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  disabled={uploadingLogo}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void onUploadLogo(file);
                    event.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên công ty" htmlFor="company-name" error={errors.name} required hint={`${nameCount}/255`}>
                <input
                  id="company-name"
                  maxLength={255}
                  value={form.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  className={fieldClassName(Boolean(errors.name))}
                />
              </Field>

              <Field label="Mã số thuế (MST)" htmlFor="company-tax-code" error={errors.taxCode} required>
                <input
                  id="company-tax-code"
                  value={form.taxCode}
                  onChange={(event) => onChange("taxCode", event.target.value)}
                  className={fieldClassName(Boolean(errors.taxCode))}
                />
              </Field>

              <Field label="Email công ty" htmlFor="company-email" error={errors.email} required>
                <input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => onChange("email", event.target.value)}
                  className={fieldClassName(Boolean(errors.email))}
                />
              </Field>

              <Field label="Số điện thoại" htmlFor="company-phone" error={errors.phone} required>
                <input
                  id="company-phone"
                  value={form.phone}
                  onChange={(event) => onChange("phone", event.target.value)}
                  className={fieldClassName(Boolean(errors.phone))}
                />
              </Field>
            </div>

            <Field label="Website" htmlFor="company-website" error={errors.website}>
              <input
                id="company-website"
                value={form.website || ""}
                onChange={(event) => onChange("website", event.target.value)}
                className={fieldClassName(Boolean(errors.website))}
              />
            </Field>

            <Field label="Địa chỉ công ty" htmlFor="company-address" error={errors.address} required>
              <input
                id="company-address"
                value={form.address}
                onChange={(event) => onChange("address", event.target.value)}
                className={fieldClassName(Boolean(errors.address))}
              />
            </Field>

            <Field label="Quy mô công ty" htmlFor="company-size" error={errors.companySize} required>
              <select
                id="company-size"
                value={form.companySize || ""}
                onChange={(event) => onChange("companySize", event.target.value)}
                className={fieldClassName(Boolean(errors.companySize))}
              >
                <option value="">Chọn quy mô</option>
                {companySizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Giới thiệu công ty"
              htmlFor="company-description"
              error={errors.description}
              required
              hint={`${descriptionCount}/2000`}
            >
              <textarea
                id="company-description"
                maxLength={2000}
                value={form.description || ""}
                onChange={(event) => onChange("description", event.target.value)}
                className={cn(fieldClassName(Boolean(errors.description)), "min-h-28 resize-y")}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-slate-300 bg-white px-6"
                onClick={onCancel}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button type="submit" className="h-10 px-6" disabled={saving}>
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {saving ? "Đang lưu..." : mode === "create" ? "Lưu thông tin" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>

          <WhyCompanyMatters />
        </div>

        <CompanyGuidanceAside />
      </div>
    </section>
  );
}

function InlineInfoCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: boolean;
}) {
  return (
    <Panel className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          {action ? (
            <button type="button" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Liên hệ hỗ trợ
              <ChevronRight className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function fieldClassName(hasError: boolean) {
  return cn(
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-100",
  );
}
