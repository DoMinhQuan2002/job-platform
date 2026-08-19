import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { CandidateProfileEntity } from "./candidate-profile.entity";
import { ResumeEntity } from "./resume.entity";
import { ApplicationStatus } from "../../common/constants";

@Entity({ name: "applications" })
@Unique(["candidateId", "jobId"])
export class ApplicationEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "job_id", type: "bigint" })
  jobId!: string;

  @Column({ name: "resume_id", type: "bigint" })
  resumeId!: string;

  @Column({ name: "resume_snapshot_url", type: "text" })
  resumeSnapshotUrl!: string;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status!: ApplicationStatus;

  @Column({ name: "applied_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  appliedAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /* Relations */
  @ManyToOne(
    () => CandidateProfileEntity,
    (candidate) => candidate.applications,
    {
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;

  @ManyToOne(() => ResumeEntity, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "resume_id" })
  resume!: ResumeEntity;
}
