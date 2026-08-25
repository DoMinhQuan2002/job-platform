import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { SystemLogEntity } from "@/database/entities/system-log.entity";
import { ListQuery } from "./system-logs.validation";

const repo = () => AppDataSource.getRepository(SystemLogEntity);

type UserBrief = { id: string; fullName: string; email: string };

export type SystemLogWithMeta = Omit<SystemLogEntity, "userId"> & {
  user: UserBrief | null;
  targetLabel: string | null;
};

/**
 * Bảng và cột chứa "tên hiển thị" của từng loại đối tượng — cả 4 đều là bảng
 * của nhóm khác, chỉ SELECT. Danh sách này cố định trong code, không nhận giá trị
 * từ request, nên nội suy tên bảng/cột vào SQL bên dưới không có rủi ro injection.
 */
const TARGET_LABEL_SOURCE: Record<string, { table: string; column: string }> = {
  USER: { table: "users", column: "email" },
  COMPANY: { table: "companies", column: "name" },
  JOB: { table: "jobs", column: "title" },
  JOB_CATEGORY: { table: "job_categories", column: "name" },
};

const fetchUsers = async (ids: string[]): Promise<Map<string, UserBrief>> => {
  if (ids.length === 0) return new Map();

  const rows: Array<{ id: string; fullName: string; email: string }> = await AppDataSource.query(
    `SELECT id, full_name AS "fullName", email FROM users WHERE id = ANY($1::bigint[])`,
    [ids],
  );

  return new Map(rows.map((row) => [row.id, row]));
};

/** Key trong map trả về là `${targetType}:${targetId}`. */
const fetchTargetLabels = async (logs: SystemLogEntity[]): Promise<Map<string, string>> => {
  const idsByType = new Map<string, Set<string>>();
  for (const log of logs) {
    if (log.targetType && log.targetId) {
      if (!idsByType.has(log.targetType)) idsByType.set(log.targetType, new Set());
      idsByType.get(log.targetType)!.add(log.targetId);
    }
  }

  const labels = new Map<string, string>();
  for (const [targetType, idSet] of idsByType) {
    const source = TARGET_LABEL_SOURCE[targetType];
    if (!source) continue;

    const rows: Array<{ id: string; label: string }> = await AppDataSource.query(
      `SELECT id, ${source.column} AS label FROM ${source.table} WHERE id = ANY($1::bigint[])`,
      [Array.from(idSet)],
    );

    for (const row of rows) labels.set(`${targetType}:${row.id}`, row.label);
  }

  return labels;
};

const enrich = async (logs: SystemLogEntity[]): Promise<SystemLogWithMeta[]> => {
  const userIds = [...new Set(logs.map((l) => l.userId).filter((id): id is string => !!id))];
  const [users, labels] = await Promise.all([fetchUsers(userIds), fetchTargetLabels(logs)]);

  // Không trả thô `userId` — đặc tả API chỉ có object `user`, tránh lộ field thừa.
  return logs.map(({ userId, ...log }) => ({
    ...log,
    user: userId ? (users.get(userId) ?? null) : null,
    targetLabel:
      log.targetType && log.targetId
        ? (labels.get(`${log.targetType}:${log.targetId}`) ?? null)
        : null,
  }));
};

export type PaginatedLogs = {
  items: SystemLogWithMeta[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const systemLogsService = {
  async list(query: ListQuery): Promise<PaginatedLogs> {
    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.targetType) where.targetType = query.targetType;
    if (query.targetId) where.targetId = query.targetId;

    if (query.fromDate && query.toDate) {
      where.createdAt = Between(new Date(query.fromDate), new Date(`${query.toDate}T23:59:59.999Z`));
    } else if (query.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      where.createdAt = LessThanOrEqual(new Date(`${query.toDate}T23:59:59.999Z`));
    }

    const [logs, total] = await repo().findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    const items = await enrich(logs);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async detail(id: string): Promise<SystemLogWithMeta> {
    const log = await repo().findOneBy({ id });
    if (!log) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy bản ghi nhật ký");
    }

    const [enriched] = await enrich([log]);
    return enriched;
  },
};
