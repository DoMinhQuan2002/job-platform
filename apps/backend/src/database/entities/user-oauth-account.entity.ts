import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "user_oauth_accounts" })
@Index("uq_oauth_provider_account", ["provider", "providerUserId"], { unique: true })
@Index("uq_user_oauth_provider", ["user", "provider"], { unique: true })
export class UserOauthAccountEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.oauthAccounts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @RelationId((account: UserOauthAccountEntity) => account.user)
  userId!: string;

  @Column({ type: "varchar", length: 30 })
  provider!: string;

  @Column({ name: "provider_user_id", type: "varchar", length: 255 })
  providerUserId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
