import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEntitiesMigration1740000000000 implements MigrationInterface {
  name = "InitialEntitiesMigration1740000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enum Types
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('APPLIED', 'VIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."candidate_skills_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."candidate_languages_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE')`,
    );

    // 2. Ensure UUID extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 3. Create candidate_profiles table
    await queryRunner.query(
      `CREATE TABLE "candidate_profiles" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "bio" text,
        "career_objective" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_candidate_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_candidate_profiles" PRIMARY KEY ("id")
      )`,
    );

    // 4. Create resumes table
    await queryRunner.query(
      `CREATE TABLE "resumes" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_url" text NOT NULL,
        "file_size" bigint NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_resumes_id_candidate" UNIQUE ("id", "candidate_id"),
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_resumes_file_size" CHECK (file_size > 0)
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_resumes_default_active" ON "resumes" ("candidate_id") WHERE is_default = TRUE AND deleted_at IS NULL`,
    );

    // 5. Create educations table
    await queryRunner.query(
      `CREATE TABLE "educations" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "school" character varying(255) NOT NULL,
        "major" character varying(255),
        "degree" character varying(100),
        "start_date" date NOT NULL,
        "end_date" date,
        "is_current" boolean NOT NULL DEFAULT false,
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_educations" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_educations_dates" CHECK (end_date IS NULL OR end_date >= start_date),
        CONSTRAINT "CHK_educations_current" CHECK (is_current = FALSE OR end_date IS NULL)
      )`,
    );

    // 6. Create work_experiences table
    await queryRunner.query(
      `CREATE TABLE "work_experiences" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "company_name" character varying(255) NOT NULL,
        "position" character varying(255) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "is_current" boolean NOT NULL DEFAULT false,
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_work_experiences" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_work_exp_dates" CHECK (end_date IS NULL OR end_date >= start_date),
        CONSTRAINT "CHK_work_exp_current" CHECK (is_current = FALSE OR end_date IS NULL)
      )`,
    );

    // 7. Create certificates table
    await queryRunner.query(
      `CREATE TABLE "certificates" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "name" character varying(255) NOT NULL,
        "issuer" character varying(255),
        "issue_date" date,
        "expiry_date" date,
        "credential_id" character varying(100),
        "credential_url" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_certificates" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_certificates_dates" CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date)
      )`,
    );

    // 8. Create skills table
    await queryRunner.query(
      `CREATE TABLE "skills" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_skills" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_skills_status" CHECK (status IN ('ACTIVE', 'INACTIVE'))
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_skills_lower_name" ON "skills" (LOWER("name"))`,
    );

    // 9. Create candidate_skills table
    await queryRunner.query(
      `CREATE TABLE "candidate_skills" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "skill_id" bigint NOT NULL,
        "level" "public"."candidate_skills_level_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_candidate_skills_candidate_skill" UNIQUE ("candidate_id", "skill_id"),
        CONSTRAINT "PK_candidate_skills" PRIMARY KEY ("id")
      )`,
    );

    // 10. Create languages table
    await queryRunner.query(
      `CREATE TABLE "languages" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(10),
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_languages" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_languages_status" CHECK (status IN ('ACTIVE', 'INACTIVE'))
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_languages_lower_name" ON "languages" (LOWER("name"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_languages_code" ON "languages" ("code") WHERE code IS NOT NULL`,
    );

    // 11. Create candidate_languages table
    await queryRunner.query(
      `CREATE TABLE "candidate_languages" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "language_id" bigint NOT NULL,
        "level" "public"."candidate_languages_level_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_candidate_languages_candidate_language" UNIQUE ("candidate_id", "language_id"),
        CONSTRAINT "PK_candidate_languages" PRIMARY KEY ("id")
      )`,
    );

    // 12. Create applications table
    await queryRunner.query(
      `CREATE TABLE "applications" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "job_id" bigint NOT NULL,
        "resume_id" bigint NOT NULL,
        "resume_snapshot_url" text NOT NULL,
        "status" "public"."applications_status_enum" NOT NULL DEFAULT 'APPLIED',
        "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_applications_candidate_job" UNIQUE ("candidate_id", "job_id"),
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      )`,
    );

    // 13. Create saved_jobs table
    await queryRunner.query(
      `CREATE TABLE "saved_jobs" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "job_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_saved_jobs_candidate_job" UNIQUE ("candidate_id", "job_id"),
        CONSTRAINT "PK_saved_jobs" PRIMARY KEY ("id")
      )`,
    );

    // 14. Create media_assets table
    await queryRunner.query(
      `CREATE TABLE "media_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "file_name" character varying(255) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size" bigint NOT NULL,
        "asset_type" character varying(50) NOT NULL DEFAULT 'company_icon',
        "storage_path" text NOT NULL,
        "public_url" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_assets" PRIMARY KEY ("id")
      )`,
    );

    // 15. Add Foreign Key Constraints
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "FK_resumes_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "educations" ADD CONSTRAINT "FK_educations_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD CONSTRAINT "FK_work_experiences_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_certificates_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" ADD CONSTRAINT "FK_candidate_skills_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" ADD CONSTRAINT "FK_candidate_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_languages" ADD CONSTRAINT "FK_candidate_languages_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_languages" ADD CONSTRAINT "FK_candidate_languages_language_id" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_resume_candidate" FOREIGN KEY ("resume_id", "candidate_id") REFERENCES "resumes"("id", "candidate_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 16. Add Performance Indexes
    await queryRunner.query(`CREATE INDEX "idx_resumes_candidate_id" ON "resumes" ("candidate_id")`);
    await queryRunner.query(`CREATE INDEX "idx_educations_candidate_id" ON "educations" ("candidate_id")`);
    await queryRunner.query(`CREATE INDEX "idx_work_experiences_candidate_id" ON "work_experiences" ("candidate_id")`);
    await queryRunner.query(`CREATE INDEX "idx_certificates_candidate_id" ON "certificates" ("candidate_id")`);
    await queryRunner.query(`CREATE INDEX "idx_candidate_skills_skill_id" ON "candidate_skills" ("skill_id")`);
    await queryRunner.query(`CREATE INDEX "idx_candidate_languages_language_id" ON "candidate_languages" ("language_id")`);
    await queryRunner.query(`CREATE INDEX "idx_applications_candidate_applied_at" ON "applications" ("candidate_id", "applied_at" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_applications_job_status" ON "applications" ("job_id", "status")`);
    await queryRunner.query(`CREATE INDEX "idx_saved_jobs_candidate_created_at" ON "saved_jobs" ("candidate_id", "created_at" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_saved_jobs_job_id" ON "saved_jobs" ("job_id")`);

    // 17. Add Triggers & Functions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const updatedTables = [
      "candidate_profiles",
      "resumes",
      "educations",
      "work_experiences",
      "certificates",
      "skills",
      "candidate_skills",
      "languages",
      "candidate_languages",
      "applications",
    ];

    for (const table of updatedTables) {
      await queryRunner.query(`
        CREATE TRIGGER trg_${table}_updated_at
        BEFORE UPDATE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION check_resume_before_apply()
      RETURNS TRIGGER AS $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM resumes
          WHERE id = NEW.resume_id AND deleted_at IS NOT NULL
        ) THEN
          RAISE EXCEPTION 'Cannot apply with a deleted resume';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_check_resume_before_apply
      BEFORE INSERT OR UPDATE ON "applications"
      FOR EACH ROW EXECUTE FUNCTION check_resume_before_apply();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop Tables (CASCADE automatically drops attached triggers, indexes, and FK constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS "media_assets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_jobs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "applications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_languages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "languages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_skills" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "skills" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "certificates" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_experiences" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "educations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resumes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_profiles" CASCADE`);

    // Drop Functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS check_resume_before_apply CASCADE`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`);

    // Drop Enum Types
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."candidate_languages_level_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."candidate_skills_level_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."applications_status_enum" CASCADE`);
  }
}
