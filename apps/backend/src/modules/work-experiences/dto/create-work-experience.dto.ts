// TODO: create-work-experience DTO
// Business Rules:
//   - companyName: bắt buộc
//   - position: bắt buộc
//   - startDate: bắt buộc
//   - isCurrent = true  → endDate phải là null/undefined
//   - isCurrent = false → endDate bắt buộc có, startDate <= endDate

export interface CreateWorkExperienceDto {
  companyName: string;
  position: string;
  startDate: string;   // format: YYYY-MM-DD
  endDate?: string;    // null nếu isCurrent = true
  isCurrent?: boolean;
  description?: string;
}
