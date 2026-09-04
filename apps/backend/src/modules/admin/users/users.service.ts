import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { UserEntity, UserStatus } from "@/database/entities/user.entity";
import { notificationService } from "@/modules/notifications/notification.service";
import { logService } from "@/modules/system-logs/log.service";
import { getSupabaseClient, getSupabaseConfig } from "@/config/supabase";
import { ListQuery, StatusBody } from "./users.validation";

const repo = () => AppDataSource.getRepository(UserEntity);

/** Chuyển đường dẫn storage (vd: avatars/xyz.jpg) thành public URL đầy đủ của Supabase. */
const resolveAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  try {
    const { publicBucket } = getSupabaseConfig();
    const client = getSupabaseClient();
    return client.storage.from(publicBucket).getPublicUrl(avatar).data.publicUrl;
  } catch {
    return avatar;
  }
};

/** Shape trả về cho list — không lộ field thô như `passwordHash`, `deletedAt`. */
const toListItem = (user: UserEntity) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  avatar: resolveAvatarUrl(user.avatar),
  role: { id: user.role.id, name: user.role.name },
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  emailVerifiedAt: user.emailVerifiedAt,
  createdAt: user.createdAt,
});

interface LocationInfo {
  wardName?: string | null;
  provinceName?: string | null;
  fullAddress?: string | null;
}

/** Shape trả về cho detail — thêm vài field profile so với list item. */
const toDetail = (user: UserEntity, locationInfo?: LocationInfo) => {
  const wardName = locationInfo?.wardName ?? null;
  const provinceName = locationInfo?.provinceName ?? null;
  const parts = [user.addressDetail, wardName, provinceName].filter(Boolean);
  const fullAddress = locationInfo?.fullAddress ?? (parts.length > 0 ? parts.join(", ") : null);

  return {
    ...toListItem(user),
    dateOfBirth: user.dateOfBirth,
    addressDetail: user.addressDetail,
    wardCode: user.wardCode,
    wardName,
    provinceName,
    fullAddress,
    updatedAt: user.updatedAt,
  };
};

export type PaginatedUsers = {
  items: ReturnType<typeof toListItem>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const adminUsersService = {
  /** GET /admin/users — lọc theo search/role/status, phân trang. */
  async list(query: ListQuery): Promise<PaginatedUsers> {
    const qb = repo().createQueryBuilder("user").innerJoinAndSelect("user.role", "role");

    if (query.search) {
      qb.andWhere("(user.email ILIKE :search OR user.fullName ILIKE :search)", {
        search: `%${query.search}%`,
      });
    }
    if (query.role) {
      qb.andWhere("role.name = :role", { role: query.role });
    }
    if (query.status) {
      qb.andWhere("user.status = :status", { status: query.status });
    }
    if (query.fromDate) {
      qb.andWhere("user.createdAt >= :fromDate", {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere("user.createdAt <= :toDate", { toDate: endOfDay });
    }

    qb.orderBy("user.createdAt", "DESC");
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      items: users.map(toListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  /** GET /admin/users/{id}. */
  async detail(id: string) {
    const user = await repo().findOne({ where: { id }, relations: { role: true } });
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy tài khoản");
    }

    let locationInfo: LocationInfo | undefined;
    if (user.wardCode) {
      try {
        const rows = await AppDataSource.query(
          `SELECT w.full_name as ward_name, p.full_name as province_name
           FROM wards w
           LEFT JOIN provinces p ON w.province_code = p.code
           WHERE w.code = $1
           LIMIT 1`,
          [user.wardCode]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          locationInfo = {
            wardName: rows[0].ward_name || null,
            provinceName: rows[0].province_name || null,
          };
        }
      } catch {
        // Non-blocking fallback if wards table is not available in mock/test
      }
    }

    return toDetail(user, locationInfo);
  },

  /**
   * PUT /admin/users/{id}/status — khóa/mở khóa 1 tài khoản.
   * Gộp 1 transaction: đổi status + ghi log + bắn thông báo cho chủ tài khoản.
   */
  async updateStatus(actingUserId: string, id: string, body: StatusBody) {
    if (id === actingUserId && body.status === "BANNED") {
      throw new AppError(403, "FORBIDDEN", "Bạn không thể tự khóa tài khoản của chính mình");
    }

    return AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const user = await userRepo.findOne({ where: { id }, relations: { role: true } });
      if (!user) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy tài khoản");
      }
      if (user.status === body.status) {
        throw new AppError(409, "CONFLICT", "Tài khoản đã ở trạng thái này");
      }

      const oldStatus = user.status;
      user.status = body.status as UserStatus;
      await userRepo.save(user);

      const isLocking = body.status === "BANNED";

      await logService.write(
        {
          userId: actingUserId,
          action: isLocking ? "LOCK_USER" : "UNLOCK_USER",
          target: { type: "USER", id: user.id },
          oldValue: oldStatus,
          newValue: body.status,
          description: isLocking ? (body.reason ?? null) : null,
        },
        manager,
      );

      if (isLocking) {
        await notificationService.create(
          {
            userId: user.id,
            type: "ACCOUNT_LOCKED",
            target: { type: "USER", id: user.id },
            params: { reason: body.reason ?? "Không có lý do cụ thể" },
          },
          manager,
        );
      } else {
        await notificationService.create(
          {
            userId: user.id,
            type: "ACCOUNT_UNLOCKED",
            target: { type: "USER", id: user.id },
          },
          manager,
        );
      }

      return {
        id: user.id,
        email: user.email,
        status: user.status,
        updatedAt: user.updatedAt,
      };
    });
  },
};
