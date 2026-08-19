import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEntitiesMigration1740000000000 implements MigrationInterface {
  name = "InitialEntitiesMigration1740000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Enum Types
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('APPLIED', 'VIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."candidate_skills_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`,
    );

    // Ensure UUID extension exists for media_assets
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create candidate_profiles table
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

    // Create resumes table
    await queryRunner.query(
      `CREATE TABLE "resumes" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_url" character varying(500) NOT NULL,
        "file_size" bigint NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id")
      )`,
    );

    // Create skills table
    await queryRunner.query(
      `CREATE TABLE "skills" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_skills_name" UNIQUE ("name"),
        CONSTRAINT "PK_skills" PRIMARY KEY ("id")
      )`,
    );

    // Create candidate_skills table
    await queryRunner.query(
      `CREATE TABLE "candidate_skills" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "skill_id" bigint NOT NULL,
        "level" "public"."candidate_skills_level_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_candidate_skills" PRIMARY KEY ("id")
      )`,
    );

    // Create educations table
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
        CONSTRAINT "PK_educations" PRIMARY KEY ("id")
      )`,
    );

    // Create work_experiences table
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
        CONSTRAINT "PK_work_experiences" PRIMARY KEY ("id")
      )`,
    );

    // Create applications table
    await queryRunner.query(
      `CREATE TABLE "applications" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "job_id" bigint NOT NULL,
        "resume_id" bigint NOT NULL,
        "status" "public"."applications_status_enum" NOT NULL DEFAULT 'APPLIED',
        "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      )`,
    );

    // Create saved_jobs table
    await queryRunner.query(
      `CREATE TABLE "saved_jobs" (
        "id" BIGSERIAL NOT NULL,
        "candidate_id" bigint NOT NULL,
        "job_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_jobs" PRIMARY KEY ("id")
      )`,
    );

    // Create media_assets table
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

    // Add Foreign Key Constraints
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "FK_resumes_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" ADD CONSTRAINT "FK_candidate_skills_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" ADD CONSTRAINT "FK_candidate_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "educations" ADD CONSTRAINT "FK_educations_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD CONSTRAINT "FK_work_experiences_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_resume_id" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop Foreign Key Constraints
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_resume_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP CONSTRAINT "FK_work_experiences_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "educations" DROP CONSTRAINT "FK_educations_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" DROP CONSTRAINT "FK_candidate_skills_skill_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skills" DROP CONSTRAINT "FK_candidate_skills_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes" DROP CONSTRAINT "FK_resumes_candidate_id"`,
    );

    // Drop Tables
    await queryRunner.query(`DROP TABLE "media_assets"`);
    await queryRunner.query(`DROP TABLE "saved_jobs"`);
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "work_experiences"`);
    await queryRunner.query(`DROP TABLE "educations"`);
    await queryRunner.query(`DROP TABLE "candidate_skills"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "resumes"`);
    await queryRunner.query(`DROP TABLE "candidate_profiles"`);

    // Drop Enum Types
    await queryRunner.query(`DROP TYPE "public"."candidate_skills_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
  }
}
