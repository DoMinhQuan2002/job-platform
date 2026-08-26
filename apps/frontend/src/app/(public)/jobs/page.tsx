import { PageSection } from "@/components/layout/page-section";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="Danh sách việc làm"
        description="Khám phá các cơ hội nghề nghiệp hấp dẫn."
      >
        <div className="mt-4">
          <Link href="/jobs/job-fe-reactjs-1">
            <Button className="rounded-xl bg-primary text-white hover:bg-primary-hover">
              Xem tin: Frontend Developer (ReactJS) - FPT Software
            </Button>
          </Link>
        </div>
      </PageSection>
    </main>
  );
}

