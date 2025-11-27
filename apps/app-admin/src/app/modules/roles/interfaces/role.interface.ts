// Role and Permission interfaces for admin app

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  level?: number;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isSystem?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

export interface RoleWithNew extends Role {
  isNew?: boolean;
}
