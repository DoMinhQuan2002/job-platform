// TODO: update-work-experience DTO — tất cả fields là optional (Partial update)

export interface UpdateWorkExperienceDto {
  companyName?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}
