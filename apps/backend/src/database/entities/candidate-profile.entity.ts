import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ResumeEntity } from "./resume.entity";
import { CandidateSkillEntity } from "./candidate-skill.entity";
import { EducationEntity } from "./education.entity";
import { WorkExperienceEntity } from "./work-experience.entity";
import { ApplicationEntity } from "./application.entity";
import { CertificateEntity } from "./certificate.entity";
import { CandidateLanguageEntity } from "./candidate-language.entity";

@Entity({ name: "candidate_profiles" })
export class CandidateProfileEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint", unique: true })
  userId!: string;

  @Column({ name: "bio", type: "text", nullable: true })
  bio!: string | null;

  @Column({ name: "career_objective", type: "text", nullable: true })
  careerObjective!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => ResumeEntity, (resume) => resume.candidate)
  resumes!: ResumeEntity[];

  @OneToMany(() => CandidateSkillEntity, (cs) => cs.candidate)
  candidateSkills!: CandidateSkillEntity[];

  @OneToMany(() => EducationEntity, (edu) => edu.candidate)
  educations!: EducationEntity[];

  @OneToMany(() => WorkExperienceEntity, (exp) => exp.candidate)
  workExperiences!: WorkExperienceEntity[];

  @OneToMany(() => CertificateEntity, (cert) => cert.candidate)
  certificates!: CertificateEntity[];

  @OneToMany(() => CandidateLanguageEntity, (lang) => lang.candidate)
  candidateLanguages!: CandidateLanguageEntity[];

  @OneToMany(() => ApplicationEntity, (app) => app.candidate)
  applications!: ApplicationEntity[];
}
