import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRoles1787300000000 implements MigrationInterface {
  name = "SeedRoles1787300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description") VALUES
        ('CANDIDATE', 'Ứng viên tìm việc'),
        ('RECRUITER', 'Nhà tuyển dụng'),
        ('ADMIN', 'Quản trị hệ thống')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Chi xoa role chua duoc gan cho user nao, tranh vi pham khoa ngoai fk_users_role.
    await queryRunner.query(`
      DELETE FROM "roles"
      WHERE "name" IN ('CANDIDATE', 'RECRUITER', 'ADMIN')
        AND NOT EXISTS (SELECT 1 FROM "users" WHERE "users"."role_id" = "roles"."id")
    `);
  }
}
