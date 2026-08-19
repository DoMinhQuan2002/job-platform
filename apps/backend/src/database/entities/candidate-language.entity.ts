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
import { LanguageEntity } from "./language.entity";
import { LanguageLevel } from "../../common/constants";

@Entity({ name: "candidate_languages" })
@Unique(["candidateId", "languageId"])
export class CandidateLanguageEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "language_id", type: "bigint" })
  languageId!: string;

  @Column({
    type: "enum",
    enum: LanguageLevel,
  })
  level!: LanguageLevel;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /* Relations */
  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.candidateLanguages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;

  @ManyToOne(() => LanguageEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "language_id" })
  language!: LanguageEntity;
}
