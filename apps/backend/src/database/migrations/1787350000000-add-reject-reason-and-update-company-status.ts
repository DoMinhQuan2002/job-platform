import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectReasonAndUpdateCompanyStatus1787350000000 implements MigrationInterface {
  name = "AddRejectReasonAndUpdateCompanyStatus1787350000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD COLUMN IF NOT EXISTS "reject_reason" text;
    `);

    await queryRunner.query(`
      ALTER TABLE "companies"
      ALTER COLUMN "status" SET DEFAULT 'PENDING';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "companies"
      ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
    `);

    await queryRunner.query(`
      ALTER TABLE "companies"
      DROP COLUMN IF EXISTS "reject_reason";
    `);
  }
}
