import { ApplicationStatus } from "../../common/constants";

export interface ApplyJobDto {
  resumeId?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
}

export interface ApplicationQueryDto {
  status?: ApplicationStatus;
  jobId?: string;
  page?: number;
  limit?: number;
}

export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [ApplicationStatus.VIEWED, ApplicationStatus.REJECTED],
  [ApplicationStatus.VIEWED]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.INTERVIEW]: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.ACCEPTED]: [],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.WITHDRAWN]: [],
};
