import { PageSection } from "@/components/layout/page-section";

export function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="CV & kỹ năng"
        description="Module resume (Lợi). Dùng resumeApi + skillsApi từ @/modules/resume/api."
      />
    </main>
  );
}
