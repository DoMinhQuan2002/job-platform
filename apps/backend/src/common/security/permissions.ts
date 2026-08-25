import { AppDataSource } from "../../data-source";
import { RolePermissionEntity } from "../../database/entities/role-permission.entity";
import { getRedis } from "../../config/redis";

const CACHE_TTL_SECONDS = 300;

const cacheKey = (roleName: string) => `perm:role:${roleName}`;

const parseCached = (raw: unknown): string[] | null => {
  if (!raw) {
    return null;
  }

  // Upstash tu deserialize JSON, nhung tuy phien ban co the tra ve string -> parse phong thu.
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;

  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? (value as string[])
    : null;
};

const queryPermissions = async (roleName: string) => {
  const rows = await AppDataSource.getRepository(RolePermissionEntity)
    .createQueryBuilder("rp")
    .innerJoin("rp.role", "role")
    .innerJoin("rp.permission", "permission")
    .select("permission.name", "name")
    .where("role.name = :roleName", { roleName })
    .getRawMany<{ name: string }>();

  return rows.map((row) => row.name);
};

/**
 * Permission cua mot role, tra qua bang role_permissions (khong hardcode ten role).
 * Cache tren Redis 300s; Redis loi thi van query thang DB - fail-open ve ha tang,
 * khong bao gio fail-open ve quyen.
 */
export const getPermissionsForRole = async (roleName: string): Promise<string[]> => {
  try {
    const cached = parseCached(await getRedis().get(cacheKey(roleName)));

    if (cached) {
      return cached;
    }
  } catch (error) {
    console.error("Permission cache read failed, falling back to DB:", error);
    return queryPermissions(roleName);
  }

  const permissions = await queryPermissions(roleName);

  try {
    await getRedis().set(cacheKey(roleName), JSON.stringify(permissions), {
      ex: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Permission cache write failed:", error);
  }

  return permissions;
};

/** Goi sau khi gan / go permission cua mot role de cache khong con lech. */
export const invalidateRolePermissions = async (roleName: string) => {
  try {
    await getRedis().del(cacheKey(roleName));
  } catch (error) {
    console.error("Permission cache invalidation failed:", error);
  }
};
