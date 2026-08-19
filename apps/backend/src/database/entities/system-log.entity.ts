import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { TargetType } from "./notification.entity";

export type LogAction =
  | "LOCK_USER"
  | "UNLOCK_USER"
  | "LOCK_COMPANY"
  | "UNLOCK_COMPANY"
  | "APPROVE_JOB"
  | "REJECT_JOB"
  | "DELETE_JOB"
  | "CREATE_JOB_CATEGORY"
  | "UPDATE_JOB_CATEGORY"
  | "DELETE_JOB_CATEGORY"
  | "LOGIN_FAILED"
  | "UPDATE_APPLICATION_STATUS";

@Entity({ name: "system_logs" })
@Index("idx_system_logs_target", ["target_type", "target_id"])
@Index("idx_system_logs_user", ["user_id", "created_at"])
@Index("idx_system_logs_action", ["action", "created_at"])
export class SystemLogEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "bigint", nullable: true })
  user_id!: string | null;

  @Column({ type: "varchar", length: 50 })
  action!: LogAction;

  @Column({ type: "varchar", length: 30, nullable: true })
  target_type!: TargetType | null;

  @Column({ type: "bigint", nullable: true })
  target_id!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  old_value!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  new_value!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
