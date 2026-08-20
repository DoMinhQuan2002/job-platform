import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Job } from "./job.entity";
import { SkillEntity } from "./skill.entity";

@Entity("job_skills")
@Index("idx_job_skills_job_skill_unique", ["jobId", "skillId"], {
  unique: true,
})
export class JobSkill {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({
    type: "bigint",
    name: "job_id",
  })
  jobId!: string;

  @Column({
    type: "bigint",
    name: "skill_id",
  })
  skillId!: string;

  @Column({
    type: "boolean",
    name: "is_required",
    default: true,
  })
  isRequired!: boolean;

  @ManyToOne(() => Job, (job: Job) => job.jobSkills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "job_id" })
  job!: Job;

  @ManyToOne(() => SkillEntity, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "skill_id" })
  skill!: SkillEntity;
}
