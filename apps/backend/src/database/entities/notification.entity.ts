import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export type NotificationType =
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED"
  | "COMPANY_LOCKED"
  | "COMPANY_UNLOCKED"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "JOB_DELETED"
  | "NEW_APPLICATION"
  | "APPLICATION_STATUS_CHANGED";

export type TargetType =
  | "USER"
  | "COMPANY"
  | "JOB"
  | "JOB_CATEGORY"
  | "APPLICATION";

@Entity({ name: "notifications" })
@Index("idx_notifications_user_read", ["user_id", "is_read", "created_at"])
@Index("idx_notifications_target", ["target_type", "target_id"])
export class NotificationEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "bigint" })
  user_id!: string;

  @Column({ type: "varchar", length: 50 })
  type!: NotificationType;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  target_type!: TargetType | null;

  @Column({ type: "bigint", nullable: true })
  target_id!: string | null;

  @Column({ type: "boolean", default: false })
  is_read!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  read_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
