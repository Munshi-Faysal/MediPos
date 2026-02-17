import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import { Role, RoleListItem, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';

/**
 * Role Service for managing roles
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private api = inject(ApiService);

  private readonly endpoint = '/Role';

  /**
   * Get paginated list of roles
   * Supports search, sorting, and filtering
   */
  getRoles(params: PaginationParams & {
    isActive?: boolean;
    isSystemRole?: boolean;
  } = {}): Observable<PagedResponse<RoleListItem>> {
    return this.api.getPaginated<RoleListItem>(this.endpoint, params);
  }

  /**
   * Get role by ID
   */
  getRoleById(id: string): Observable<Role> {
    return this.api.get<Role>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new role
   */
  createRole(role: CreateRoleRequest): Observable<Role> {
    return this.api.post<Role>(this.endpoint, role);
  }

  /**
   * Update an existing role
   */
  updateRole(id: string, role: UpdateRoleRequest): Observable<Role> {
    return this.api.put<Role>(`${this.endpoint}/${id}`, role);
  }

  /**
   * Delete a role
   */
  deleteRole(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a role
   */
  activateRole(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a role
   */
  deactivateRole(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Get role statistics (for dashboard cards)
   * This would need to be implemented in the backend
   */
  getRoleStatistics(): Observable<{
    totalRoles: number;
    activeRoles: number;
    systemRoles: number;
    customRoles: number;
  }> {
    // For now, we'll fetch all roles and calculate statistics
    // In the future, you can add a dedicated endpoint like /Role/statistics
    return new Observable(observer => {
      this.getRoles({ page: 1, pageSize: 1000 }).subscribe({
        next: (response) => {
          const roles = response.data;
          const statistics = {
            totalRoles: response.totalCount,
            activeRoles: roles.filter(r => r.isActive).length,
            systemRoles: roles.filter(r => r.isSystemRole).length,
            customRoles: roles.filter(r => !r.isSystemRole).length
          };
          observer.next(statistics);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}

