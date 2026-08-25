import { PageSection } from "@/components/layout/page-section";

export function CandidateProfilePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="Hồ sơ ứng viên"
        description="Module candidate (Bình). Dùng candidateApi từ @/modules/candidate/api."
      />
    </main>
  );
}
