export const educationsService = {
  // TODO: Thêm học vấn — validate dates, isCurrent logic
  create: async (_candidateId: string, _data: unknown) => {
    throw new Error("TODO: create education");
  },

  // TODO: Sửa học vấn — validate ownership (id + candidateId), dates
  update: async (_id: string, _candidateId: string, _data: unknown) => {
    throw new Error("TODO: update education");
  },

  // TODO: Xóa học vấn — validate ownership (id + candidateId), hard delete
  remove: async (_id: string, _candidateId: string) => {
    throw new Error("TODO: remove education");
  },
};
