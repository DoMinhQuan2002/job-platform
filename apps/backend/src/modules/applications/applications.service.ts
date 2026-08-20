import { ApplicationStatus } from "../../common/constants";
import { ROLES } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { AppDataSource } from "../../data-source";
import { ApplicationEntity } from "../../database/entities/application.entity";

/**
 * State machine: định nghĩa các trạng thái được phép chuyển đến
 * từ mỗi trạng thái hiện tại — dùng enum ApplicationStatus, không hardcode string.
 *
 * Terminal states (ACCEPTED, REJECTED, WITHDRAWN) không có entry trong map
 * → tự động bị chặn bởi logic bên dưới.
 */

export class ApplicationsService {
  private appRepo = AppDataSource.getRepository(ApplicationEntity);

  // ──────────────────────────────────────────────────────────────
  // NỘP ĐƠN ỨNG TUYỂN
  // ──────────────────────────────────────────────────────────────
  async apply(candidateId: string, data: { jobId: string; resumeId: string }) {
    try {
      const application = this.appRepo.create({
        ...data,
        candidateId,
      });
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi không thể nộp đơn", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // LỊCH SỬ ỨNG TUYỂN CỦA ỨNG VIÊN
  // ──────────────────────────────────────────────────────────────
  async getMyApplications(candidateId: string) {
    try {
      return await this.appRepo.find({
        where: { candidateId },
        relations: ["job", "job.company"],
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi lấy danh sách ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // CHI TIẾT MỘT ĐƠN ỨNG TUYỂN
  // ──────────────────────────────────────────────────────────────
  async getMyApplicationById(id: string, candidateId: string) {
    try {
      const application = await this.appRepo.findOne({
        where: { id, candidateId },
        relations: ["job", "job.company"],
      });
      if (!application) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy đơn ứng tuyển");
      }
      return application;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi lấy chi tiết đơn ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // RÚT ĐƠN ỨNG TUYỂN (chỉ khi status = APPLIED)
  // ──────────────────────────────────────────────────────────────
  async withdraw(id: string, candidateId: string) {
    try {
      const application = await this.getMyApplicationById(id, candidateId);

      if (application.status !== ApplicationStatus.APPLIED) {
        throw new AppError(
          400,
          "BUSINESS_RULE_VIOLATION",
          `Không thể rút đơn khi trạng thái là "${application.status}"`,
        );
      }

      application.status = ApplicationStatus.WITHDRAWN;
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi rút đơn ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // NHÀ TUYỂN DỤNG CẬP NHẬT TRẠNG THÁI
  // ──────────────────────────────────────────────────────────────

  async updateStatus(id: string, recruiterUserId: string, newStatus: ApplicationStatus) {
    try {
      // Bước 1: Tìm đơn ứng tuyển kèm thông tin job và company
      const application = await this.appRepo.findOne({
        where: { id },
        relations: ["job", "job.company"],
      });
      if (!application) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy đơn ứng tuyển");
      }

      // Bước 2: Kiểm tra recruiter có phải chủ của Job này không (Cross-Group)
      if (application.job.company.userId !== recruiterUserId) {
        throw new AppError(403, "FORBIDDEN", "Bạn không có quyền cập nhật trạng thái đơn này");
      }

      // Bước 3: Validate newStatus có phải là giá trị hợp lệ trong enum không
      const validStatuses = Object.values(ApplicationStatus) as string[];
      if (!validStatuses.includes(newStatus)) {
        throw new AppError(400, "VALIDATION_ERROR", `Trạng thái "${newStatus}" không hợp lệ`);
      }

      // Bước 4: Lưu trạng thái mới
      application.status = newStatus as ApplicationStatus;
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi cập nhật trạng thái", error);
    }
  }
}

export const applicationsService = new ApplicationsService();
