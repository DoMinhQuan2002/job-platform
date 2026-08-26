"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import type { JobDetail, RelatedJob } from "../types";
import { JobHeaderCard } from "../components/job-header-card";
import { JobContentSections } from "../components/job-content-sections";
import { JobSidebar } from "../components/job-sidebar";
import { JobNewsletter } from "../components/job-newsletter";
import { ApplyModal } from "../components/apply-modal";
import { applicationsApi } from "../api";


const DEFAULT_JOB_DATA: JobDetail = {
  id: "job-fe-reactjs-1",
  title: "Frontend Developer (ReactJS)",
  company: {
    name: "FPT Software",
    logoUrl: "",
    verified: true,
    rating: 4.6,
    reviewCount: 328,
    industry: "Công nghệ thông tin",
    size: "1.000+ nhân viên",
    website: "www.fpt-software.com",
    phone: "024 7300 9999",
    address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
    about:
      "FPT Software là công ty công nghệ hàng đầu Việt Nam, thành viên của Tập đoàn FPT. Chúng tôi cung cấp các dịch vụ và giải pháp phần mềm đẳng cấp thế giới cho hàng trăm khách hàng toàn cầu tại hơn 26 quốc gia.",
  },
  salary: "20 - 30 triệu VND",
  location: "Hà Nội",
  jobType: "Toàn thời gian",
  workplaceType: "Tại văn phòng",
  experience: "2 - 4 năm",
  quantity: "10 người",
  deadline: "20/06/2025",
  summary:
    "Bạn sẽ tham gia phát triển các sản phẩm phần mềm quy mô lớn, sử dụng công nghệ hiện đại, làm việc trong môi trường chuyên nghiệp, năng động và có nhiều cơ hội phát triển nghề nghiệp.",
  tags: ["ReactJS", "TypeScript", "JavaScript", "HTML/CSS", "RESTful API"],
  description: [
    "Phát triển các ứng dụng web sử dụng ReactJS, TypeScript.",
    "Phối hợp với team backend và designer để xây dựng sản phẩm.",
    "Tối ưu hiệu năng và đảm bảo tính bảo mật cho ứng dụng.",
    "Tham gia code review và đóng góp cải tiến quy trình phát triển.",
    "Nghiên cứu, áp dụng các công nghệ mới để nâng cao chất lượng sản phẩm.",
  ],
  requirements: [
    "Tốt nghiệp Đại học chuyên ngành CNTT hoặc các ngành liên quan.",
    "Có 2-4 năm kinh nghiệm phát triển Frontend với ReactJS.",
    "Thành thạo JavaScript (ES6+), TypeScript, HTML5, CSS3.",
    "Hiểu biết về RESTful API, Git, và các công cụ build (Webpack, Vite...).",
    "Có tư duy tốt, chủ động trong công việc và tinh thần trách nhiệm cao.",
  ],
  benefits: [
    "Lương cạnh tranh, thưởng theo hiệu quả công việc.",
    "Chế độ nghỉ phép, nghỉ lễ theo quy định.",
    "Thưởng lễ tết, tháng 13, thưởng dự án.",
    "Đào tạo nội bộ, hỗ trợ học tập và phát triển.",
    "Bảo hiểm sức khỏe (FPT Care) và bảo hiểm theo quy định.",
    "Môi trường làm việc hiện đại, nhiều hoạt động nội bộ.",
  ],
  skills: {
    required: [
      "ReactJS",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "RESTful API",
      "Git",
    ],
    optional: [
      "Next.js",
      "Redux / Zustand",
      "Tailwind CSS",
      "Unit Test (Jest)",
      "Webpack / Vite",
    ],
  },
  isSaved: false,
};

const RELATED_JOBS: RelatedJob[] = [
  {
    id: "job-rel-1",
    title: "JavaScript Developer",
    companyName: "Viettel Solutions",
    location: "Hà Nội",
    salary: "15 - 25 triệu VND",
  },
  {
    id: "job-rel-2",
    title: "Frontend Developer (VueJS)",
    companyName: "VNG Corporation",
    location: "Hà Nội",
    salary: "20 - 30 triệu VND",
  },
];

interface JobApplyPageProps {
  initialJob?: JobDetail;
}

export function JobApplyPage({ initialJob = DEFAULT_JOB_DATA }: JobApplyPageProps) {
  const params = useParams();
  const paramJobId = (params?.id as string) || initialJob.id;
  const [job, setJob] = useState<JobDetail>(initialJob);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (!paramJobId || paramJobId.startsWith("job-fe")) return;

    const fetchJob = async () => {
      try {
        const res = await applicationsApi.getJobDetail(paramJobId);
        if (res && res.data) {
          const item = res.data as unknown as Record<string, unknown>;
          const companyObj = (item.company as Record<string, unknown>) || {};
          setJob((prev) => ({
            ...prev,
            id: String(item.id),
            title: String(item.title || prev.title),
            salary: String(item.salary || prev.salary),
            location: String(item.location || prev.location),
            jobType: String(item.jobType || prev.jobType),
            workplaceType: String(item.workplaceType || prev.workplaceType),
            experience: String(item.experience || prev.experience),
            deadline: item.deadline
              ? new Date(String(item.deadline)).toLocaleDateString("vi-VN")
              : prev.deadline,
            summary: String(item.description || prev.summary),
            company: {
              ...prev.company,
              name: String(companyObj.name || item.companyName || prev.company.name),
              logoUrl: typeof companyObj.logoUrl === "string" ? companyObj.logoUrl : prev.company.logoUrl,
            },
          }));
        }

      } catch {
        // Fall back to sample state
      }
    };

    fetchJob();
  }, [paramJobId]);


  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/jobs" className="hover:text-primary transition">
            Việc làm
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="hover:text-primary transition cursor-pointer">IT phần mềm</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 line-clamp-1">{job.title}</span>
        </nav>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Job Header & Content (~8/12 = 67%) */}
          <div className="space-y-6 lg:col-span-8">
            <JobHeaderCard
              job={job}
              onOpenApplyModal={() => setIsApplyModalOpen(true)}
            />
            <JobContentSections job={job} />
          </div>

          {/* Right Column: Sidebar (~4/12 = 33%) */}
          <div className="lg:col-span-4">
            <JobSidebar
              company={job.company}
              relatedJobs={RELATED_JOBS}
            />
          </div>
        </div>

        {/* Bottom Subscription Banner */}
        <div className="pt-2">
          <JobNewsletter />
        </div>
      </div>

      {/* Apply Modal Dialog */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.name}
        companyLogoUrl={job.company.logoUrl}
        location={job.location}
        salary={job.salary}
        onApplySuccess={() => {
          setJob((prev) => ({ ...prev, hasApplied: true }));
        }}
      />
    </div>
  );
}
