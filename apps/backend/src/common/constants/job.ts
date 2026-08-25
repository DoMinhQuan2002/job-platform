// 1. Company Status
export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
} as const;
export type CompanyStatusValue = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];

// 2. Company Size
export const COMPANY_SIZE = {
  SIZE_1_50: '1-50',
  SIZE_50_100: '50-100',
  SIZE_100_500: '100-500',
  SIZE_500_PLUS: '500+',
} as const;
export type CompanySizeValue = (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];

// 3. Job Category Status
export const JOB_CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type JobCategoryStatusValue = (typeof JOB_CATEGORY_STATUS)[keyof typeof JOB_CATEGORY_STATUS];

// 4. Job Type
export const JOB_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
} as const;
export type JobTypeValue = (typeof JOB_TYPE)[keyof typeof JOB_TYPE];

// 5. Job Mode
export const JOB_MODE = {
  ONSITE: 'ONSITE',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
} as const;
export type JobModeValue = (typeof JOB_MODE)[keyof typeof JOB_MODE];

// 6. Job Status
export const JOB_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  OPEN: 'OPEN',
  HIDDEN:'HIDDEN',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
} as const;
export type JobStatusValue = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
