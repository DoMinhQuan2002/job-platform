import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Seed permission theo docs/api-contract/group1/permissions.md muc 1.
 * Chi seed 2 permission doc danh dau "Dang dung"; role:read / permission:read /
 * permission:assign cho Leader xac nhan GD2 co API quan ly roles-permissions hay khong.
 */
const PERMISSIONS = [
  { name: "user:read", description: "Xem danh sách / chi tiết user" },
  { name: "user:update_status", description: "Đổi trạng thái user (khoá / mở tài khoản)" },
];

const ADMIN_PERMISSIONS = PERMISSIONS.map((permission) => permission.name);

export class SeedPermissions1787300000001 implements MigrationInterface {
  name = "SeedPermissions1787300000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("name", "description")
         VALUES ($1, $2)
         ON CONFLICT ("name") DO NOTHING`,
        [permission.name, permission.description],
      );
    }

    // Gan qua subquery theo name de khong phu thuoc id cung.
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id")
       SELECT r."id", p."id"
       FROM "roles" r
       CROSS JOIN "permissions" p
       WHERE r."name" = 'ADMIN' AND p."name" = ANY($1)
       ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
      [ADMIN_PERMISSIONS],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xoa ban ghi noi truoc roi moi xoa permission, tranh vi pham khoa ngoai.
    await queryRunner.query(
      `DELETE FROM "role_permissions"
       WHERE "permission_id" IN (SELECT "id" FROM "permissions" WHERE "name" = ANY($1))`,
      [ADMIN_PERMISSIONS],
    );

    await queryRunner.query(`DELETE FROM "permissions" WHERE "name" = ANY($1)`, [
      ADMIN_PERMISSIONS,
    ]);
  }
}
