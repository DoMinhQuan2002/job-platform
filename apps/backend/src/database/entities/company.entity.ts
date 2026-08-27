import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { COMPANY_STATUS, CompanyStatusValue } from "../../common/constants/job";
import { Job } from "./job.entity";
import { UserEntity } from "./user.entity";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({
    type: "bigint",
    name: "user_id",
    unique: true,
  })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  slug!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  logo!: string | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  website!: string | null;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 20 })
  phone!: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    name: "tax_code",
  })
  taxCode!: string | null;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    name: "company_size",
  })
  companySize!: string | null;

  @Column({ type: "varchar", length: 255 })
  address!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "text",
    nullable: true,
    name: "reject_reason",
  })
  rejectReason!: string | null;

  @Column({
    type: "varchar",
    length: 30,
    default: COMPANY_STATUS.PENDING,
  })
  status!: CompanyStatusValue;

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

  @OneToMany(() => Job, (job: Job) => job.company)
  jobs!: Job[];
}
