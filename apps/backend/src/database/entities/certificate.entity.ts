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

@Entity({ name: "certificates" })
export class CertificateEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name!: string;

  @Column({ name: "issuer", type: "varchar", length: 255, nullable: true })
  issuer!: string | null;

  @Column({ name: "issue_date", type: "date", nullable: true })
  issueDate!: string | null;

  @Column({ name: "expiry_date", type: "date", nullable: true })
  expiryDate!: string | null;

  @Column({ name: "credential_id", type: "varchar", length: 100, nullable: true })
  credentialId!: string | null;

  @Column({ name: "credential_url", type: "text", nullable: true })
  credentialUrl!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /* Relations */
  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.certificates, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;
}
