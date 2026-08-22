import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { CandidateProfileEntity } from "./candidate-profile.entity";

@Entity({ name: "saved_jobs" })
@Unique(["candidateId", "jobId"])
export class SavedJobEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "job_id", type: "bigint" })
  jobId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  /* Relations */
  @ManyToOne(() => CandidateProfileEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;
}
