export const savedJobsService = {
  // TODO: Lưu Job
  // Validate Cross-Group: jobId có tồn tại trong bảng jobs không
  // Nếu đã lưu rồi → 409 Conflict
  save: async (_candidateId: string, _jobId: string) => {
    throw new Error("TODO: save job");
  },

  // TODO: Lấy danh sách Job đã lưu
  // JOIN jobs, companies (Nhóm 2) để lấy title, salary, company name, logo
  getMySavedJobs: async (_candidateId: string) => {
    throw new Error("TODO: getMySavedJobs");
  },

  // TODO: Bỏ lưu Job (xóa cứng record)
  unsave: async (_candidateId: string, _jobId: string) => {
    throw new Error("TODO: unsave job");
  },
};
