export const workExperiencesService = {
  // TODO: Thêm kinh nghiệm — validate isCurrent logic (isCurrent=true thì endDate=null)
  create: async (_candidateId: string, _data: unknown) => {
    throw new Error("TODO: create work experience");
  },

  // TODO: Sửa kinh nghiệm — validate ownership (id + candidateId)
  update: async (_id: string, _candidateId: string, _data: unknown) => {
    throw new Error("TODO: update work experience");
  },

  // TODO: Xóa kinh nghiệm — validate ownership (id + candidateId), hard delete
  remove: async (_id: string, _candidateId: string) => {
    throw new Error("TODO: remove work experience");
  },
};
