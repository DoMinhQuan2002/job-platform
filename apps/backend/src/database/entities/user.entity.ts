import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { RoleEntity } from "./role.entity";
import { SessionEntity } from "./session.entity";
import { UserOauthAccountEntity } from "./user-oauth-account.entity";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
}

@Entity({ name: "users" })
@Index("idx_users_role_id", ["role"])
@Index("idx_users_status", ["status"])
@Index("idx_users_ward_code", ["wardCode"])
export class UserEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, { nullable: false })
  @JoinColumn({ name: "role_id" })
  role!: RoleEntity;

  @RelationId((user: UserEntity) => user.role)
  roleId!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ name: "full_name", type: "varchar", length: 100 })
  fullName!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar!: string | null;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth!: string | null;

  @Column({ name: "address_detail", type: "varchar", length: 255, nullable: true })
  addressDetail!: string | null;

  @Column({ name: "ward_code", type: "varchar", length: 20, nullable: true })
  wardCode!: string | null;

  @Column({ type: "enum", enum: UserStatus, enumName: "status_user", default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt!: Date | null;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions!: SessionEntity[];

  @OneToMany(() => UserOauthAccountEntity, (account) => account.user)
  oauthAccounts!: UserOauthAccountEntity[];
}
