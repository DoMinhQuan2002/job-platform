import { IsNull } from "typeorm";
import { AppError } from "../../common/errors/app-error";
import { AppDataSource } from "../../data-source";
import { ResumeEntity } from "../../database/entities/resume.entity";
import { storageService } from "../../common/storage/storage.service";

/** Owner: Nguyễn Văn Lợi */
export const resumesService = {
  async getMyResumes(candidateId: string) {
    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    return await resumeRepo.find({
      where: { candidateId, deletedAt: IsNull() },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });
  },

  async getById(candidateId: string, id: string) {
    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    const resume = await resumeRepo.findOne({
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

    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    
    // Check quota max 5 CVs
    const count = await resumeRepo.count({ where: { candidateId, deletedAt: IsNull() } });
    if (count >= 5) {
      throw new AppError(400, "QUOTA_EXCEEDED", "Chỉ được phép tải lên tối đa 5 CV");
    }

    // Tự động xử lý upload lên Supabase Storage (bỏ qua API Media)
    const storedObject = await storageService.upload({
      assetType: "resume",
      fileName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });

    // Nếu là CV đầu tiên, bắt buộc set default
    const isDefault = count === 0;

    const resume = resumeRepo.create({
      candidateId,
      fileName: file.originalname,
      fileUrl: storedObject.storagePath, // Lưu storagePath
      fileSize: file.size,
      mimeType: file.mimetype,
      isDefault,
    });

    return await resumeRepo.save(resume);
  },

  async setDefault(candidateId: string, id: string) {
    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    
    const resume = await resumeRepo.findOne({ where: { id, candidateId, deletedAt: IsNull() } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại hoặc đã bị xóa");

    await AppDataSource.transaction(async (manager) => {
      // Bỏ default tất cả CV cũ
      await manager.update(ResumeEntity, { candidateId }, { isDefault: false });
      // Set default CV mới
      await manager.update(ResumeEntity, { id }, { isDefault: true });
    });

    return await resumeRepo.findOne({ where: { id } });
  },

  async deleteMine(candidateId: string, id: string) {
    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    const resume = await resumeRepo.findOne({ where: { id, candidateId, deletedAt: IsNull() } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại hoặc đã bị xóa");

    // 1. Soft delete DB
    await resumeRepo.softDelete(id);

    // 2. Xóa vật lý trên Supabase
    try {
      await storageService.remove(resume.fileUrl, "resume");
    } catch (error) {
      console.error(`Failed to remove file from Supabase: ${resume.fileUrl}`, error);
    }

    // 3. Promote CV khác thành Default nếu CV vừa xóa là CV Default
    if (resume.isDefault) {
      const latestResume = await resumeRepo.findOne({
        where: { candidateId, deletedAt: IsNull() },
        order: { createdAt: "DESC" }
      });
      if (latestResume) {
        latestResume.isDefault = true;
        await resumeRepo.save(latestResume);
      }
    }
  },

  async getAccessUrl(candidateId: string, id: string) {
    const resumeRepo = AppDataSource.getRepository(ResumeEntity);
    const resume = await resumeRepo.findOne({ where: { id, candidateId } });
    if (!resume) throw new AppError(404, "NOT_FOUND", "CV không tồn tại");

    return await storageService.getAccessUrl(resume.fileUrl, "resume");
  }
};
