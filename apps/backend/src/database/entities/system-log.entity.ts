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
@Index("idx_system_logs_target", ["targetType", "targetId"])
@Index("idx_system_logs_user", ["userId", "createdAt"])
@Index("idx_system_logs_action", ["action", "createdAt"])
export class SystemLogEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint", nullable: true })
  userId!: string | null;

  @Column({ name: "action", type: "varchar", length: 50 })
  action!: LogAction;

  @Column({ name: "target_type", type: "varchar", length: 30, nullable: true })
  targetType!: TargetType | null;

  @Column({ name: "target_id", type: "bigint", nullable: true })
  targetId!: string | null;

  @Column({ name: "old_value", type: "varchar", length: 255, nullable: true })
  oldValue!: string | null;

  @Column({ name: "new_value", type: "varchar", length: 255, nullable: true })
  newValue!: string | null;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
