import { MigrationInterface, QueryRunner } from "typeorm";

export class MergeLanguagesCertificatesIntoSkills1787200000001 implements MigrationInterface {
  name = "MergeLanguagesCertificatesIntoSkills1787200000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_languages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "languages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "certificates" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."candidate_languages_level_enum"`);

    await queryRunner.query(
      `ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "category" character varying(30) NOT NULL DEFAULT 'SKILL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "code" character varying(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT IF EXISTS "UQ_skills_name"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_skills_lower_name"`);
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "CHK_skills_category" CHECK (category IN ('SKILL', 'LANGUAGE', 'CERTIFICATE'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "CHK_skills_language_code" CHECK (category = 'LANGUAGE' OR code IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_skills_category_lower_name" ON "skills" ("category", LOWER("name"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_skills_language_code" ON "skills" ("code") WHERE category = 'LANGUAGE' AND code IS NOT NULL`,
    );
    await queryRunner.query(`CREATE INDEX "idx_skills_category" ON "skills" ("category")`);

    await queryRunner.query(
      `ALTER TYPE "public"."candidate_skills_level_enum" ADD VALUE IF NOT EXISTS 'NATIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_skills_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_skills_language_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_skills_category_lower_name"`);
    await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT IF EXISTS "CHK_skills_language_code"`);
    await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT IF EXISTS "CHK_skills_category"`);
    await queryRunner.query(`ALTER TABLE "skills" DROP COLUMN IF EXISTS "code"`);
    await queryRunner.query(`ALTER TABLE "skills" DROP COLUMN IF EXISTS "category"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_skills_lower_name" ON "skills" (LOWER("name"))`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."candidate_languages_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE')`,
    );

    await queryRunner.query(`
      CREATE TABLE "certificates" (
        "id" bigint GENERATED ALWAYS AS IDENTITY,
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
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_certificates_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(`
      CREATE TABLE "languages" (
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "name" character varying(100) NOT NULL,
        "code" character varying(10),
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_languages" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_languages_status" CHECK (status IN ('ACTIVE', 'INACTIVE'))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_languages_lower_name" ON "languages" (LOWER("name"))`,
    );

    await queryRunner.query(`
      CREATE TABLE "candidate_languages" (
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "candidate_id" bigint NOT NULL,
        "language_id" bigint NOT NULL,
        "level" "public"."candidate_languages_level_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_candidate_languages_candidate_language" UNIQUE ("candidate_id", "language_id"),
        CONSTRAINT "PK_candidate_languages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "candidate_languages" ADD CONSTRAINT "FK_candidate_languages_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_languages" ADD CONSTRAINT "FK_candidate_languages_language_id" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT`,
    );
  }
}
