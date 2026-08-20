import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SkillCategory } from "../../common/constants";

@Entity({ name: "skills" })
export class SkillEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({
    type: "varchar",
    length: 30,
    default: SkillCategory.SKILL,
  })
  category!: SkillCategory;

  @Column({ type: "varchar", length: 10, nullable: true })
  code!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 30, default: "ACTIVE" })
  status!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
