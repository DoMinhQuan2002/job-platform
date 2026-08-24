import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const supabaseStorageService = {
  /**
   * Upload file lên Supabase Storage
   * @param bucket  Tên bucket (vd: "resumes")
   * @param path    Đường dẫn file trong bucket (vd: "candidateId/timestamp-filename.pdf")
   * @param buffer  Buffer của file (từ multer memoryStorage)
   * @param mimeType MIME type của file (vd: "application/pdf")
   * @returns Public URL của file đã upload
   */
  uploadFile: async (
    bucket: string,
    path: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> => {
    // TODO: Implement upload lên Supabase Storage
    throw new Error("TODO: uploadFile");
  },

  /**
   * Xóa file khỏi Supabase Storage
   * @param bucket  Tên bucket
   * @param path    Đường dẫn file trong bucket
   */
  deleteFile: async (bucket: string, path: string): Promise<void> => {
    // TODO: Implement delete khỏi Supabase Storage
    throw new Error("TODO: deleteFile");
  },
};

export { supabase };
