import { EntityManager } from "typeorm";
import { AppDataSource } from "../../data-source";
import { LogAction, SystemLogEntity } from "../../database/entities/system-log.entity";
import { TargetType } from "../../database/entities/notification.entity";

/** Giới hạn thật của cột trong bảng `system_logs`. */
const MAX_VALUE_LENGTH = 255;
const MAX_IP_LENGTH = 45;

/**
 * Cắt bớt cho vừa cột thay vì để Postgres ném lỗi.
 * Ghi log nằm chung transaction với nghiệp vụ, nên một chuỗi quá dài sẽ làm
 * rollback cả thao tác chính — cắt bớt an toàn hơn. Đuôi "..." để người đọc
 * log biết giá trị đã bị cắt.
 */
const truncate = (value: string | null | undefined, max: number): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 3)}...`;
};

export type WriteLogInput = {
  /** Người thực hiện hành động. NULL khi chưa xác định được (ví dụ LOGIN_FAILED). */
  userId: string | null;
  action: LogAction;
  /** Bỏ trống thì cả `target_type` và `target_id` cùng NULL. */
  target?: { type: TargetType; id: string };
  /** Giá trị trước khi thay đổi — caller phải đọc TRƯỚC khi UPDATE. */
  oldValue?: string | null;
  newValue?: string | null;
  /** Lý do do người dùng nhập. Chỉ 4/12 hành động có, còn lại để trống. */
  description?: string | null;
  ipAddress?: string | null;
};

export const logService = {
  /**
   * Ghi một dòng nhật ký hệ thống.
   *
   * Truyền `manager` khi muốn ghi trong transaction của caller; bỏ trống thì
   * ghi ngay bằng connection mặc định.
   */
  async write(input: WriteLogInput, manager?: EntityManager): Promise<SystemLogEntity> {
    const repository = (manager ?? AppDataSource.manager).getRepository(SystemLogEntity);

    const log = repository.create({
      userId: input.userId,
      action: input.action,
      targetType: input.target?.type ?? null,
      targetId: input.target?.id ?? null,
      oldValue: truncate(input.oldValue, MAX_VALUE_LENGTH),
      newValue: truncate(input.newValue, MAX_VALUE_LENGTH),
      description: input.description ?? null,
      ipAddress: truncate(input.ipAddress, MAX_IP_LENGTH),
    });

    return repository.save(log);
  },

  /**
   * Lý do khóa tài khoản mới nhất (lưu ở `system_logs.description` khi LOCK_USER).
   * Dùng khi login bị chặn để trả message có lý do cho client.
   */
  async findLatestUserLockReason(userId: string): Promise<string | null> {
    const log = await AppDataSource.getRepository(SystemLogEntity).findOne({
      where: {
        action: "LOCK_USER",
        targetType: "USER",
        targetId: userId,
      },
      order: { createdAt: "DESC" },
    });

    const reason = log?.description?.trim();
    return reason ? reason : null;
  },
};
