import { IsNull } from "typeorm";
import { AppError } from "../../common/errors/app-error";
import { AppDataSource } from "../../data-source";
import { ResumeEntity } from "../../database/entities/resume.entity";
import { mediaService } from "../media/media.service";

// Sử dụng helper function thay vì gọi thẳng ở top-level để tránh lỗi "DataSource is not initialized"
const getRepo = () => AppDataSource.getRepository(ResumeEntity);

/** Owner: Nguyễn Văn Lợi */
export const resumesService = {
  async getMyResumes(candidateId: string) {
    return await getRepo().find({
      where: { candidateId, deletedAt: IsNull() },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });
  },

  async getById(candidateId: string, id: string) {
    const resume = await getRepo().findOne({
      where: { id, candidateId, deletedAt: IsNull() },
    });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại hoặc đã bị xóa");
    return resume;
  },

  async createOwnerResume(candidateId: string, file: Express.Multer.File | undefined) {
    if (!file) throw new AppError(400, "BAD_REQUEST", "Cần có CV (file) để tải lên!");
    if (file.mimetype !== "application/pdf") {
      throw new AppError(400, "INVALID_FILE_TYPE", "Chỉ chấp nhận file PDF");
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new AppError(400, "FILE_TOO_LARGE", "File size vượt quá 10MB");
    }

    // Check quota max 5 CVs
    const count = await getRepo().count({ where: { candidateId, deletedAt: IsNull() } });
    if (count >= 5) {
      throw new AppError(400, "QUOTA_EXCEEDED", "Chỉ được phép tải lên tối đa 5 CV");
    }

    const storedObject = await mediaService.upload({
      assetType: "resume",
      fileName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });

    // Nếu là CV đầu tiên, bắt buộc set default
    const isDefault = count === 0;

    const resume = getRepo().create({
      candidateId,
      fileName: file.originalname,
      fileUrl: storedObject.storagePath, // Lưu storagePath
      fileSize: file.size,
      mimeType: file.mimetype,
      isDefault,
    });

    return await getRepo().save(resume);
  },

  async setDefault(candidateId: string, id: string) {
    const resume = await getRepo().findOne({ where: { id, candidateId, deletedAt: IsNull() } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại hoặc đã bị xóa");

    await AppDataSource.transaction(async (manager) => {
      // Bỏ default tất cả CV cũ
      await manager.update(ResumeEntity, { candidateId }, { isDefault: false });
      // Set default CV mới
      await manager.update(ResumeEntity, { id }, { isDefault: true });
    });

    return await getRepo().findOne({ where: { id } });
  },

  async deleteMine(candidateId: string, id: string) {
    const resume = await getRepo().findOne({ where: { id, candidateId, deletedAt: IsNull() } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại hoặc đã bị xóa");

    // 1. Soft delete DB
    await getRepo().softDelete(id);

    // 2. Xóa vật lý trên Supabase
    try {
      await mediaService.remove(resume.fileUrl, "resume");
    } catch (error) {
      console.error(`Failed to remove file from Supabase: ${resume.fileUrl}`, error);
    }

    // 3. Promote CV khác thành Default nếu CV vừa xóa là CV Default
    if (resume.isDefault) {
      const latestResume = await getRepo().findOne({
        where: { candidateId, deletedAt: IsNull() },
        order: { createdAt: "DESC" }
      });
      if (latestResume) {
        latestResume.isDefault = true;
        await getRepo().save(latestResume);
      }
    }
  },

  async getAccessUrl(candidateId: string, id: string) {
    const resume = await getRepo().findOne({ where: { id, candidateId } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại");

    return await mediaService.getAccessUrl(resume.fileUrl, "resume");
  }
};
