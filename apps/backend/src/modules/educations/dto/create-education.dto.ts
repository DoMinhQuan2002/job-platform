// TODO: create-education DTO
// Business Rules:
//   - school: bắt buộc
//   - startDate: bắt buộc
//   - isCurrent = true  → endDate phải là null/undefined
//   - isCurrent = false → endDate bắt buộc có, startDate <= endDate

export interface CreateEducationDto {
  school: string;
  major?: string;
  degree?: string;
  startDate: string; // format: YYYY-MM-DD
  endDate?: string;  // format: YYYY-MM-DD, null nếu isCurrent = true
  isCurrent?: boolean;
  description?: string;
}
