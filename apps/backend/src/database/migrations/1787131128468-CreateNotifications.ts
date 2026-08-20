import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications1787131128468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "type" character varying(50) NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "target_type" character varying(30), "target_id" bigint, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "pk_notifications" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_user_read" ON "notifications" ("user_id", "is_read", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_target" ON "notifications" ("target_type", "target_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "chk_notifications_target" CHECK (("target_type" IS NULL AND "target_id" IS NULL) OR ("target_type" IS NOT NULL AND "target_id" IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "fk_notifications_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "chk_notifications_target"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_notifications_target"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_notifications_user_read"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
