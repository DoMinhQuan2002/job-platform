// TODO: update-education DTO — tất cả fields là optional (Partial update)

export interface UpdateEducationDto {
  school?: string;
  major?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}
