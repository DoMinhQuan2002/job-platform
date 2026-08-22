import { Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { RoleEntity } from "./role.entity";

@Entity({ name: "role_permissions" })
@Index("uq_role_permissions", ["role", "permission"], { unique: true })
@Index("idx_role_permissions_role_id", ["role"])
@Index("idx_role_permissions_permission_id", ["permission"])
export class RolePermissionEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions, { nullable: false })
  @JoinColumn({ name: "role_id" })
  role!: RoleEntity;

  @ManyToOne(() => PermissionEntity, (permission) => permission.rolePermissions, {
    nullable: false,
  })
  @JoinColumn({ name: "permission_id" })
  permission!: PermissionEntity;

  @RelationId((rolePermission: RolePermissionEntity) => rolePermission.role)
  roleId!: string;

  @RelationId((rolePermission: RolePermissionEntity) => rolePermission.permission)
  permissionId!: string;
}
