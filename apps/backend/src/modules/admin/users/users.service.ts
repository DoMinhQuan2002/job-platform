import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { UserEntity, UserStatus } from "@/database/entities/user.entity";
import { notificationService } from "@/modules/notifications/notification.service";
import { logService } from "@/modules/system-logs/log.service";
import { ListQuery, StatusBody } from "./users.validation";

const repo = () => AppDataSource.getRepository(UserEntity);

const toListItem = (user: UserEntity) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  avatar: user.avatar,
  role: { id: user.role.id, name: user.role.name },
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  emailVerifiedAt: user.emailVerifiedAt,
  createdAt: user.createdAt,
});

const toDetail = (user: UserEntity) => ({
  ...toListItem(user),
  dateOfBirth: user.dateOfBirth,
  addressDetail: user.addressDetail,
  wardCode: user.wardCode,
  updatedAt: user.updatedAt,
});

export type PaginatedUsers = {
  items: ReturnType<typeof toListItem>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const adminUsersService = {
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

  async detail(id: string) {
    const user = await repo().findOne({ where: { id }, relations: { role: true } });
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy tài khoản");
    }

    return toDetail(user);
  },

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

      await notificationService.create(
        {
          userId: user.id,
          type: isLocking ? "ACCOUNT_LOCKED" : "ACCOUNT_UNLOCKED",
          target: { type: "USER", id: user.id },
        },
        manager,
      );

      return {
        id: user.id,
        email: user.email,
        status: user.status,
        updatedAt: user.updatedAt,
      };
    });
  },
};
