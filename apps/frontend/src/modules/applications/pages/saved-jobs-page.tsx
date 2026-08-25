import { PageSection } from "@/components/layout/page-section";

export function SavedJobsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="Việc đã lưu"
        description="Module applications (Mạnh). Dùng applicationsApi.listSavedJobs / unsaveJob."
      />
    </main>
  );
}
