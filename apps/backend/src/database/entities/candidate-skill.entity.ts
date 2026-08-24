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
import { SkillEntity } from "./skill.entity";
import { SkillLevel } from "../../common/constants";

@Entity({ name: "candidate_skills" })
@Unique(["candidateId", "skillId"])
export class CandidateSkillEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "candidate_id", type: "bigint" })
  candidateId!: string;

  @Column({ name: "skill_id", type: "bigint" })
  skillId!: string;

  @Column({
    type: "enum",
    enum: SkillLevel,
  })
  level!: SkillLevel;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /* Relations */
  @ManyToOne(() => CandidateProfileEntity, (candidate) => candidate.skills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: CandidateProfileEntity;

  @ManyToOne(() => SkillEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "skill_id" })
  skill!: SkillEntity;
}
