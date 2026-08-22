import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "sessions" })
@Index("idx_sessions_user_id", ["user"])
@Index("idx_sessions_expires_at", ["expiresAt"])
export class SessionEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @RelationId((session: SessionEntity) => session.user)
  userId!: string;

  @Column({ name: "refresh_token_hash", type: "varchar", length: 64, unique: true })
  refreshTokenHash!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @Column({ name: "is_revoked", type: "boolean", default: false })
  isRevoked!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
