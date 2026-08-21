import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { ResumeEntity } from "./resume.entity";
import { EducationEntity } from "./education.entity";
import { WorkExperienceEntity } from "./work-experience.entity";
import { CandidateSkillEntity } from "./candidate-skill.entity";
import { ApplicationEntity } from "./application.entity";
import { SavedJobEntity } from "./saved-job.entity";

@Entity({ name: "candidate_profiles" })
export class CandidateProfileEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ name: "career_objective", type: "text", nullable: true })
  careerObjective!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToOne(() => UserEntity, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @OneToMany(() => ResumeEntity, (resume) => resume.candidate)
  resumes!: ResumeEntity[];

  @OneToMany(() => EducationEntity, (edu) => edu.candidate)
  educations!: EducationEntity[];

  @OneToMany(() => WorkExperienceEntity, (exp) => exp.candidate)
  workExperiences!: WorkExperienceEntity[];

  @OneToMany(() => CandidateSkillEntity, (skill) => skill.candidate)
  skills!: CandidateSkillEntity[];

  @OneToMany(() => ApplicationEntity, (app) => app.candidate)
  applications!: ApplicationEntity[];

  @OneToMany(() => SavedJobEntity, (savedJob) => savedJob.candidate)
  savedJobs!: SavedJobEntity[];
}
