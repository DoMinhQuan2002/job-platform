import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavedJobsJobForeignKey1787380000000 implements MigrationInterface {
  name = "AddSavedJobsJobForeignKey1787380000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_saved_jobs_job_id'
        ) THEN
          ALTER TABLE "saved_jobs"
          ADD CONSTRAINT "FK_saved_jobs_job_id"
          FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "saved_jobs"
      DROP CONSTRAINT IF EXISTS "FK_saved_jobs_job_id";
    `);
  }
}
