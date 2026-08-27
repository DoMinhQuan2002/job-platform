import type { RecruiterJobStatus } from "@/services/recruiter-jobs.service";

export type JobStatusFilter = "ALL" | RecruiterJobStatus;

const tabs: Array<{ value: JobStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "OPEN", label: "Đang tuyển" },
  { value: "CLOSED", label: "Đã đóng" },
  { value: "HIDDEN", label: "Ẩn" },
  { value: "REJECTED", label: "Bị từ chối" },
];

type JobStatusTabsProps = {
  value: JobStatusFilter;
  onChange: (value: JobStatusFilter) => void;
  counts: Partial<Record<JobStatusFilter, number>>;
};

export function JobStatusTabs({ value, onChange, counts }: JobStatusTabsProps) {
  return (
    <div className="flex min-w-max items-center gap-1" role="tablist" aria-label="Lọc theo trạng thái tin">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`border-b-2 px-3 py-2.5 text-xs font-medium transition ${
            value === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          {tab.label} ({counts[tab.value] ?? 0})
        </button>
      ))}
    </div>
  );
}
