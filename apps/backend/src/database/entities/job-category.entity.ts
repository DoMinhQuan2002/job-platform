import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import {
  JOB_CATEGORY_STATUS,
  JobCategoryStatusValue,
} from "../../common/constants/job";
import { Job } from "./job.entity";

@Entity("job_categories")
export class JobCategory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "varchar",
    length: 30,
    default: JOB_CATEGORY_STATUS.ACTIVE,
  })
  status!: JobCategoryStatusValue;

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

  @OneToMany(() => Job, (job: Job) => job.category)
  jobs!: Job[];
}
