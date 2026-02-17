import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Permission Service for managing role permissions
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private api = inject(ApiService);

  private readonly endpoint = '/Permission';

  /**
   * Save permissions for a role
   * @param roleId Role ID
   * @param permissionKeys Array of permission keys (e.g., ["user_view", "role_create"])
   */
  saveRolePermissions(roleId: string, permissionKeys: string[]): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/role/${roleId}`, permissionKeys);
  }

  /**
   * Get permissions for a role
   */
  getRolePermissions(roleId: string): Observable<{
    roleId: string;
    permissions: {
      id: string;
      roleId: string;
      roleName: string;
      permissionId: string;
      menuName: string;
      actionName: string;
      permissionKey: string;
      isActive: boolean;
      createdAt: string;
    }[];
  }> {
    return this.api.get<{
      roleId: string;
      permissions: {
        id: string;
        roleId: string;
        roleName: string;
        permissionId: string;
        menuName: string;
        actionName: string;
        permissionKey: string;
        isActive: boolean;
        createdAt: string;
      }[];
    }>(`${this.endpoint}/role/${roleId}`);
  }

  /**
   * Get permission keys for a role (simplified list)
   */
  getRolePermissionKeys(roleId: string): Observable<string[]> {
    return this.api.get<string[]>(`${this.endpoint}/role/${roleId}/keys`);
  }
}
