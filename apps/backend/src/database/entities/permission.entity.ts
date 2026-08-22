import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RolePermissionEntity } from "./role-permission.entity";

@Entity({ name: "permissions" })
export class PermissionEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string | null;

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermissionEntity[];
}
