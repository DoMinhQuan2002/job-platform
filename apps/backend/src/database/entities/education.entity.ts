import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CandidateProfileEntity } from "./candidate-profile.entity";

@Entity({ name: "educations" })
export class EducationEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ type: "varchar", length: 255 })
  school!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  major!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  degree!: string | null;

  @Column({ name: "start_date", type: "date" })
  startDate!: string;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate!: string | null;

  @Column({ name: "is_current", type: "boolean", default: false })
  isCurrent!: boolean;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /* Relations */
  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.educations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;
}
