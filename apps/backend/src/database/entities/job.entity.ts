import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import {
  JOB_STATUS,
  JobStatusValue,
  JOB_TYPE,
  JobTypeValue,
  JOB_MODE,
  JobModeValue,
} from "../../common/constants/job";
import { Company } from "./company.entity";
import { JobCategory } from "./job-category.entity";
import { JobSkill } from "./job-skill.entity";

@Entity("jobs")
@Index("idx_jobs_company_id", ["companyId"])
@Index("idx_jobs_category_id", ["categoryId"])
@Index("idx_jobs_status", ["status"])
export class Job {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "bigint", name: "company_id" })
  companyId!: string;

  @Column({
    type: "bigint",
    name: "category_id",
  })
  categoryId!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  title!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  slug!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  requirements!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  benefits!: string | null;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
    name: "salary_min",
  })
  salaryMin!: string | null;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
    name: "salary_max",
  })
  salaryMax!: string | null;

  @Column({
    type: "boolean",
    name: "is_negotiable",
    default: false,
  })
  isNegotiable!: boolean;

  @Column({
    type: "varchar",
    length: 255,
  })
  address!: string;

  @Column({
    type: "varchar",
    length: 50,
    name: "job_type",
    default: JOB_TYPE.FULL_TIME,
  })
  jobType!: JobTypeValue;

  @Column({
    type: "varchar",
    length: 50,
    name: "job_mode",
    default: JOB_MODE.ONSITE,
  })
  jobMode!: JobModeValue;

  @Column({
    type: "int",
    nullable: true,
  })
  experience!: number | null;

  @Column({
    type: "int",
    nullable: true,
    default: 1,
  })
  quantity!: number | null;

  @Column({ type: "date" })
  deadline!: Date;

  @Column({
    type: "text",
    nullable: true,
    name: "reject_reason",
  })
  rejectReason!: string | null;

  @Column({
    type: "varchar",
    length: 30,
    default: JOB_STATUS.PENDING,
  })
  status!: JobStatusValue;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at", nullable: true })
  updatedAt!: Date | null;

  @DeleteDateColumn({
    type: "timestamptz",
    name: "deleted_at",
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => Company, (company: Company) => company.jobs, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @ManyToOne(() => JobCategory, (category: JobCategory) => category.jobs, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "category_id" })
  category!: JobCategory;

  @OneToMany(() => JobSkill, (jobSkill: JobSkill) => jobSkill.job, {
    cascade: true,
  })
  jobSkills!: JobSkill[];
}
