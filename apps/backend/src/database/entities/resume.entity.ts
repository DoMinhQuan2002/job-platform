import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { CandidateProfileEntity } from "./candidate-profile.entity";

@Entity({ name: "resumes" })
@Unique(["id", "candidateId"])
export class ResumeEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "file_name", type: "varchar", length: 255 })
  fileName!: string;

  @Column({ name: "file_url", type: "text" })
  fileUrl!: string;

  @Column({ name: "file_size", type: "bigint" })
  fileSize!: number;

  @Column({ name: "mime_type", type: "varchar", length: 100 })
  mimeType!: string;

  @Column({ name: "is_default", type: "boolean", default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.resumes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;
}
