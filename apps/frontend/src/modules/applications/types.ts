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
  candidateId: string;
  createdAt: string;
};

export type ApplyJobInput = {
  resumeId?: string;
};
