/**
 * Role models matching backend DTOs
 */

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  userCount: number;
}

export interface RoleListItem {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string; // Required by backend
  isSystemRole?: boolean;
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  name: string;
  description: string; // Required by backend
  isActive: boolean;
}

export interface RoleFilters {
  search?: string;
  isActive?: boolean;
  isSystemRole?: boolean;
}

