import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of, forkJoin, map, catchError, tap, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { UserService, UserRole } from './user.service';

/**
 * Centralized Permission Check Service
 * Handles all permission checking logic centrally
 * Components should use this service instead of checking permissions directly
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionCheckService {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);

  // Cache for user permissions
  private userPermissions = signal<string[]>([]);
  private permissionsLoaded = signal(false);
  private isLoadingPermissions = signal(false);


  /**
   * Load permissions (simplified version)
   */
  loadPermissions(): void {
    if (this.permissionsLoaded() || this.isLoadingPermissions()) {
      return;
    }

    this.isLoadingPermissions.set(true);
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.roles || currentUser.roles.length === 0) {
      this.userPermissions.set([]);
      this.permissionsLoaded.set(true);
      this.isLoadingPermissions.set(false);
      return;
    }

    // Get role ID from role name
    this.userService.getRoles().subscribe({
      next: (roles: UserRole[]) => {
        const roleName = currentUser.roles[0];
        const role = roles.find(r => r.name === roleName || r.id === roleName);
        const roleId = role?.id || currentUser.roles[0];

        // Get permissions for this role
        this.permissionService.getRolePermissionKeys(roleId).subscribe({
          next: (permissionKeys: string[]) => {
            this.userPermissions.set(permissionKeys);
            this.permissionsLoaded.set(true);
            this.isLoadingPermissions.set(false);
          },
          error: () => {
            this.userPermissions.set([]);
            this.permissionsLoaded.set(true);
            this.isLoadingPermissions.set(false);
          }
        });
      },
      error: () => {
        this.userPermissions.set([]);
        this.permissionsLoaded.set(true);
        this.isLoadingPermissions.set(false);
      }
    });
  }

  /**
   * Check if user has permission for a specific action on a menu
   * @param menuName Menu name (e.g., "Menus Action")
   * @param actionName Action name (e.g., "Approve", "Edit", "View")
   * @returns true if user has permission, false otherwise
   */
  hasPermission(menuName: string, actionName: string): boolean {
    const permissions = this.userPermissions();
    
    // If no permissions loaded, allow all (fail open) - but only if permissions haven't been attempted to load
    // If permissions were loaded and array is empty, deny access (fail closed)
    if (!this.permissionsLoaded()) {
      // Permissions not loaded yet, allow temporarily
      return true;
    }

    if (permissions.length === 0) {
      // Permissions loaded but empty - deny access
      return false;
    }

    // Create permission key: "menus_action_approve" for menu "Menus Action" and action "Approve"
    // Backend uses menu.Name (not Label) to create permission keys
    const menuKey = this.createMenuKey(menuName);
    const actionKey = actionName.toLowerCase();
    const permissionKey = `${menuKey}_${actionKey}`;

    // Debug logging
    const hasPermission = permissions.includes(permissionKey);


    // Check if user has this permission
    return hasPermission;
  }

  /**
   * Check if user has view permission for a menu (for menu visibility)
   * @param menuName Menu name
   * @returns true if user has view permission, false otherwise
   */
  hasViewPermission(menuName: string): boolean {
    return this.hasPermission(menuName, 'View');
  }

  /**
   * Get all user permissions
   */
  getUserPermissions(): string[] {
    return this.userPermissions();
  }

  /**
   * Check if permissions are loaded
   */
  arePermissionsLoaded(): boolean {
    return this.permissionsLoaded();
  }

  /**
   * Refresh permissions (reload from backend)
   * Should be called after permissions are saved/updated
   */
  refreshPermissions(): void {
    this.permissionsLoaded.set(false);
    this.userPermissions.set([]);
    this.isLoadingPermissions.set(false);
    this.loadPermissions();
  }

  /**
   * Create a safe key from menu name for permission value
   * Must match backend CreateMenuKey method EXACTLY
   * Backend: menuName.ToLower().Replace(" ", "_").Replace("-", "_").Replace(".", "_")
   * 
   * IMPORTANT: Backend does sequential replacements, which can create multiple underscores
   * Example: "Settings - Users" → "Settings_-_Users" → "Settings___Users" → "settings___users"
   * We must match this behavior exactly, NOT collapse underscores!
   */
  private createMenuKey(menuName: string): string {
    return menuName.toLowerCase()
      .replace(/\s+/g, '_')   // Replace spaces with underscore (may create multiple if space-hyphen-space pattern)
      .replace(/-/g, '_')      // Replace hyphens with underscore (may create triple underscores)
      .replace(/\./g, '_');    // Replace dots with underscore
    // DO NOT collapse multiple underscores - backend doesn't do this!
  }
}
