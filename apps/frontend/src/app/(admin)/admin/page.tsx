import { PageSection } from "@/components/layout/page-section";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="Admin Workspace"
        description="Admin team implements moderation, analytics, account management, and system operations here."
      />
    </main>
  );
}
