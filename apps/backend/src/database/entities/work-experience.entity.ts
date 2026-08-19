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

@Entity({ name: "work_experiences" })
export class WorkExperienceEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "company_name", type: "varchar", length: 255 })
  companyName!: string;

  @Column({ type: "varchar", length: 255 })
  position!: string;

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
  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.workExperiences, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;
}
