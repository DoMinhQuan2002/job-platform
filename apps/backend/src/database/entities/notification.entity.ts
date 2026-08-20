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
@Index("idx_notifications_user_read", ["userId", "isRead", "createdAt"])
@Index("idx_notifications_target", ["targetType", "targetId"])
export class NotificationEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ name: "type", type: "varchar", length: 50 })
  type!: NotificationType;

  @Column({ name: "title", type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

  @Column({ name: "target_type", type: "varchar", length: 30, nullable: true })
  targetType!: TargetType | null;

  @Column({ name: "target_id", type: "bigint", nullable: true })
  targetId!: string | null;

  @Column({ name: "is_read", type: "boolean", default: false })
  isRead!: boolean;

  @Column({ name: "read_at", type: "timestamptz", nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
