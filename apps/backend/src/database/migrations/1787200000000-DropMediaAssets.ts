import { MigrationInterface, QueryRunner } from "typeorm";

export class DropMediaAssets1787200000000 implements MigrationInterface {
  name = "DropMediaAssets1787200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "media_assets"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "media_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "file_name" character varying(255) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size" bigint NOT NULL,
        "asset_type" character varying(50) NOT NULL DEFAULT 'company_icon',
        "storage_path" text NOT NULL,
        "public_url" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_assets" PRIMARY KEY ("id")
      )
    `);
  }
}
