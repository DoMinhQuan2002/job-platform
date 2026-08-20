import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemLogs1787131139087 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "system_logs" ("id" BIGSERIAL NOT NULL, "user_id" bigint, "action" character varying(50) NOT NULL, "target_type" character varying(30), "target_id" bigint, "old_value" character varying(255), "new_value" character varying(255), "description" text, "ip_address" character varying(45), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "pk_system_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_system_logs_target" ON "system_logs" ("target_type", "target_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_system_logs_user" ON "system_logs" ("user_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_system_logs_action" ON "system_logs" ("action", "created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_logs" ADD CONSTRAINT "fk_system_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "system_logs" DROP CONSTRAINT "fk_system_logs_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_system_logs_action"`);
    await queryRunner.query(`DROP INDEX "public"."idx_system_logs_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_system_logs_target"`);
    await queryRunner.query(`DROP TABLE "system_logs"`);
  }
}
