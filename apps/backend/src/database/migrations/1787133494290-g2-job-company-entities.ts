import { MigrationInterface, QueryRunner } from "typeorm";

export class G2JobCompanyEntities1787133494290 implements MigrationInterface {
  name = "G2JobCompanyEntities1787133494290";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create companies table
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "logo" character varying(255),
        "website" character varying(255),
        "email" character varying(255) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "tax_code" character varying(50),
        "company_size" character varying(50),
        "address" character varying(255) NOT NULL,
        "description" text,
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "uq_companies_user_id" UNIQUE ("user_id"),
        CONSTRAINT "uq_companies_slug" UNIQUE ("slug"),
        CONSTRAINT "pk_companies" PRIMARY KEY ("id")
      )
    `);

    // 2. Create job_categories table
    await queryRunner.query(`
      CREATE TABLE "job_categories" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "slug" character varying(150) NOT NULL,
        "description" text,
        "status" character varying(30) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "uq_job_categories_name" UNIQUE ("name"),
        CONSTRAINT "uq_job_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "pk_job_categories" PRIMARY KEY ("id")
      )
    `);

    // 3. Create jobs table
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" BIGSERIAL NOT NULL,
        "company_id" bigint NOT NULL,
        "category_id" bigint NOT NULL,
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "requirements" text NOT NULL,
        "benefits" text,
        "salary_min" numeric(15,2),
        "salary_max" numeric(15,2),
        "is_negotiable" boolean NOT NULL DEFAULT false,
        "address" character varying(255) NOT NULL,
        "job_type" character varying(50) NOT NULL DEFAULT 'FULL_TIME',
        "job_mode" character varying(50) NOT NULL DEFAULT 'ONSITE',
        "experience" integer,
        "quantity" integer DEFAULT 1,
        "deadline" date NOT NULL,
        "reject_reason" text,
        "status" character varying(30) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "pk_jobs" PRIMARY KEY ("id")
      )
    `);

    // 4. Create job_skills table
    await queryRunner.query(`
      CREATE TABLE "job_skills" (
        "id" BIGSERIAL NOT NULL,
        "job_id" bigint NOT NULL,
        "skill_id" bigint NOT NULL,
        "is_required" boolean NOT NULL DEFAULT true,
        CONSTRAINT "pk_job_skills" PRIMARY KEY ("id")
      )
    `);

    // 5. Create Indexes
    await queryRunner.query(`CREATE INDEX "idx_jobs_company_id" ON "jobs" ("company_id")`);
    await queryRunner.query(`CREATE INDEX "idx_jobs_category_id" ON "jobs" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "idx_jobs_status" ON "jobs" ("status")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_job_skills_job_skill_unique" ON "job_skills" ("job_id", "skill_id")`
    );

    // 6. Foreign Key Constraints
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD CONSTRAINT "fk_companies_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
      ADD CONSTRAINT "fk_jobs_company"
      FOREIGN KEY ("company_id") REFERENCES "companies"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
      ADD CONSTRAINT "fk_jobs_category"
      FOREIGN KEY ("category_id") REFERENCES "job_categories"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "job_skills"
      ADD CONSTRAINT "fk_job_skills_job"
      FOREIGN KEY ("job_id") REFERENCES "jobs"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "job_skills"
      ADD CONSTRAINT "fk_job_skills_skill"
      FOREIGN KEY ("skill_id") REFERENCES "skills"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop Foreign Key Constraints
    await queryRunner.query(`ALTER TABLE "job_skills" DROP CONSTRAINT IF EXISTS "fk_job_skills_skill"`);
    await queryRunner.query(`ALTER TABLE "job_skills" DROP CONSTRAINT IF EXISTS "fk_job_skills_job"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "fk_jobs_category"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "fk_jobs_company"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "fk_companies_user"`);

    // 2. Drop Tables
    await queryRunner.query(`DROP TABLE IF EXISTS "job_skills"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
  }
}
