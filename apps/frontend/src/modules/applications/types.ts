export type ApplicationStatus =
  | "APPLIED"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId: string | null;
  resumeSnapshotUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string;
};

export type SavedJob = {
  id: string;
  jobId: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  experience: string;
  salary: string;
  category: string;
  savedDate: string;
  createdAt?: string;
  candidateId?: string;
};


export type ApplyJobInput = {
  resumeId?: string;
};

export type CompanyDetail = {
  name: string;
  logoUrl?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  address?: string;
  about?: string;
};

export type RelatedJob = {
  id: string;
  title: string;
  companyName: string;
  logoUrl?: string;
  location: string;
  salary: string;
  isSaved?: boolean;
};

export type JobDetail = {
  id: string;
  title: string;
  company: CompanyDetail;
  salary: string;
  location: string;
  jobType: string;
  workplaceType: string;
  experience: string;
  quantity: string;
  deadline: string;
  summary: string;
  tags: string[];
  description: string[];
  requirements: string[];
  benefits: string[];
  skills: {
    required: string[];
    optional: string[];
  };
  isSaved?: boolean;
  hasApplied?: boolean;
};

export type TemplateStatus = "USED" | "DRAFT";


export type ApplicationTemplate = {
  id: string;
  title: string;
  description: string;
  content?: string;
  status: TemplateStatus;
  updatedAt: string;
  lastUsedAt: string | null;
  category?: string;
};

export type ApplicationTimelineStep = {
  title: string;
  description: string;
  time: string;
  status: "COMPLETED" | "CURRENT" | "PENDING";
};

export type DetailedApplication = {
  id: string;
  code: string;
  appliedAt: string;
  statusText: string;
  status: ApplicationStatus;
  jobTitle: string;
  department: string;
  workplaceType: string;
  location: string;
  expectedSalary: string;
  coverLetterName: string;
  resumeName: string;
  resumeUrl?: string;
  company: {
    name: string;
    logoUrl?: string;
    website?: string;
  };
  jobSummary: {
    title: string;
    jobType: string;
    location: string;
    salary: string;
    experience: string;
    postedDate: string;
    deadline: string;
  };
  timeline: ApplicationTimelineStep[];
};



