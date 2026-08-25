import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "media_assets" })
export class MediaAssetEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fileName!: string;

  @Column({ type: "varchar", length: 120 })
  mimeType!: string;

  @Column({ type: "bigint" })
  size!: number;

  @Column({ type: "varchar", length: 50, default: "company_icon" })
  assetType!: string;

  @Column({ type: "text" })
  storagePath!: string;

  @Column({ type: "text", nullable: true })
  publicUrl!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
