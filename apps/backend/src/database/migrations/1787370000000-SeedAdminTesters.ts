import { MigrationInterface, QueryRunner } from "typeorm";
import { hashPassword } from "../../common/security/password";

/** Testers ADMIN — mật khẩu chung: Admin123. Idempotent theo email. */
const ADMIN_TESTERS = [
  { email: "camly@jobplatform.app", fullName: "Cẩm Ly" },
  { email: "thuylinh@jobplatform.app", fullName: "Thùy Linh" },
] as const;

const ADMIN_TESTER_PASSWORD = "Admin123";

export class SeedAdminTesters1787370000000 implements MigrationInterface {
  name = "SeedAdminTesters1787370000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await hashPassword(ADMIN_TESTER_PASSWORD);

    for (const tester of ADMIN_TESTERS) {
      await queryRunner.query(
        `INSERT INTO "users" (
           "role_id", "email", "password_hash", "full_name", "status", "email_verified_at"
         )
         SELECT r."id", $1::varchar, $2::varchar, $3::varchar, 'ACTIVE'::"status_user", NOW()
         FROM "roles" r
         WHERE r."name" = 'ADMIN'
           AND NOT EXISTS (SELECT 1 FROM "users" u WHERE u."email" = $1::varchar)`,
        [tester.email, passwordHash, tester.fullName],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "users" WHERE "email" = ANY($1::varchar[])`,
      [ADMIN_TESTERS.map((tester) => tester.email)],
    );
  }
}
