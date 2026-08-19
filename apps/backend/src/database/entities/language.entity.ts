import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "languages" })
export class LanguageEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "name", type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "code", type: "varchar", length: 10, nullable: true })
  code!: string | null;

  @Column({ name: "status", type: "varchar", length: 30, default: "ACTIVE" })
  status!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
