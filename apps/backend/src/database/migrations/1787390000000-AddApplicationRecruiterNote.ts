import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationRecruiterNote1787390000000 implements MigrationInterface {
  name = "AddApplicationRecruiterNote1787390000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD COLUMN IF NOT EXISTS "recruiter_note" text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD COLUMN IF NOT EXISTS "recruiter_note_updated_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      DROP COLUMN IF EXISTS "recruiter_note_updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "applications"
      DROP COLUMN IF EXISTS "recruiter_note"
    `);
  }
}
