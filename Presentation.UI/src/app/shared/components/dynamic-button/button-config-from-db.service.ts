import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, map, catchError, of, filter, take, timer, switchMap, race, forkJoin } from 'rxjs';
import { DynamicButtonConfig } from './dynamic-button.component';
import { MenuActionService } from '../../../core/services/menu-action.service';
import { MenuAction } from '../../../core/models/menu-action.model';
import { PermissionCheckService } from '../../../core/services/permission-check.service';
import { MenuService } from '../../../core/services/menu.service';

/**
 * Service to load button configurations from database MenuActions
 * Maps MenuAction (name, icon, description) to DynamicButtonConfig
 */
@Injectable({
  providedIn: 'root'
})
export class ButtonConfigFromDbService {
  private menuActionService = inject(MenuActionService);
  private permissionCheckService = inject(PermissionCheckService);
  private menuService = inject(MenuService);
  
  // Cache for menu actions
  private menuActions = signal<MenuAction[]>([]);
  private isLoading = signal(false);
  private isLoaded = signal(false);
  
  // Menu ID and name for permission checking (can be set per component)
  private menuId: string | null = null;
  private menuName = 'Menus Action'; // Default menu name
  private currentMenu = signal<{ id: string; name: string } | null>(null);

  /**
   * Set menu ID - will fetch menu name from ID
   * @param menuId Menu ID (Guid string)
   */
  setMenuId(menuId: string): void {
    this.menuId = menuId;
    // Fetch menu details to get menu name
    this.menuService.getMenuById(menuId).pipe(
      catchError(error => {
        console.error('Error fetching menu by ID:', error);
        return of(null);
      })
    ).subscribe(menu => {
      if (menu) {
        this.menuName = menu.name;
        this.currentMenu.set({ id: menuId, name: menu.name });
        console.log(`✅ Menu ID ${menuId} resolved to menu name: "${menu.name}"`);
      }
    });
  }

  /**
   * Set menu by route - will fetch menu ID and name from route
   * @param route The route path (e.g., '/admin/bank-account/all')
   */
  setMenuByRoute(route: string): void {
    this.menuService.getMenuByRoute(route).pipe(
      catchError(error => {
        console.error('Error fetching menu by route:', error);
        return of(null);
      })
    ).subscribe(menu => {
      if (menu) {
        this.menuId = menu.id;
        this.menuName = menu.name;
        this.currentMenu.set({ id: menu.id, name: menu.name });
        console.log(`✅ Route "${route}" resolved to menu ID: ${menu.id}, name: "${menu.name}"`);
      } else {
        console.warn(`⚠️ No menu found for route: "${route}"`);
      }
    });
  }

  /**
   * Set menu name for permission checking (legacy method - prefer setMenuId or setMenuByRoute)
   * @param menuName Menu name (e.g., "Menus Action", "Users", etc.)
   */
  setMenuName(menuName: string): void {
    this.menuName = menuName;
    this.menuId = null; // Clear menu ID when setting name directly
    this.currentMenu.set(null);
  }

  /**
   * Load all active menu actions from database
   */
  loadMenuActions(): Observable<MenuAction[]> {
    if (this.isLoaded() && this.menuActions().length > 0) {
      return of(this.menuActions());
    }

    this.isLoading.set(true);
    return this.menuActionService.getActiveMenuActions().pipe(
      map((actions) => {
        this.menuActions.set(actions);
        this.isLoaded.set(true);
        this.isLoading.set(false);
        return actions;
      }),
      catchError((error) => {
        console.error('Error loading menu actions:', error);
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get button configuration by action name
   * @param actionName The name of the action (e.g., 'Create', 'Delete', 'Edit')
   * @returns DynamicButtonConfig or null if not found
   */
  getButtonConfigByActionName(actionName: string): Observable<DynamicButtonConfig | null> {
    return this.loadMenuActions().pipe(
      map((actions) => {
        const action = actions.find(
          (a) => a.name.toLowerCase() === actionName.toLowerCase()
        );
        
        if (!action) {
          return null;
        }

        return this.mapMenuActionToButtonConfig(action);
      })
    );
  }

  /**
   * Get button configurations for multiple action names
   * @param actionNames Array of action names
   * @returns Observable of DynamicButtonConfig array
   */
  getButtonConfigsByActionNames(actionNames: string[]): Observable<DynamicButtonConfig[]> {
    return this.loadMenuActions().pipe(
      map((actions) => {
        return actionNames
          .map((name) => {
            const action = actions.find(
              (a) => a.name.toLowerCase() === name.toLowerCase()
            );
            return action ? this.mapMenuActionToButtonConfig(action) : null;
          })
          .filter((config): config is DynamicButtonConfig => config !== null);
      })
    );
  }

  /**
   * Get all button configurations from database
   * Filters actions based on user permissions
   * Only shows buttons for actions the user has permission for
   * Waits for permissions to load before filtering
   * @returns Observable of DynamicButtonConfig array
   */
  getAllButtonConfigs(): Observable<DynamicButtonConfig[]> {
    // Ensure permissions are loaded
    if (!this.permissionCheckService.arePermissionsLoaded()) {
      this.permissionCheckService.loadPermissions();
    }

    // Wait for permissions to load (poll every 100ms, max 10 seconds)
    const waitForPermissions = (): Observable<boolean> => {
      const permissionCheck$ = timer(0, 100).pipe(
        map(() => this.permissionCheckService.arePermissionsLoaded()),
        filter(loaded => loaded === true),
        take(1),
        map(() => true)
      );
      
      const timeout$ = timer(10000).pipe(
        map(() => {
          console.warn('Timeout waiting for permissions to load, proceeding with button load');
          return true; // Proceed anyway after timeout
        })
      );
      
      // Race between permission load and timeout
      return race(permissionCheck$, timeout$);
    };

    return waitForPermissions().pipe(
      switchMap(() => {
        // If menu ID is set, get menu actions for that specific menu
        if (this.menuId) {
          return forkJoin({
            menu: this.menuService.getMenuById(this.menuId).pipe(
              catchError(() => of(null))
            ),
            menuWithActions: this.menuActionService.getMenuWithActions(this.menuId).pipe(
              catchError(() => of(null))
            ),
            allActions: this.loadMenuActions()
          });
        } else {
          // Fallback to loading all actions (legacy behavior)
          return forkJoin({
            menu: of(null),
            menuWithActions: of(null),
            allActions: this.loadMenuActions()
          });
        }
      }),
      map(({ menu, menuWithActions, allActions }) => {
        // Update menu name if menu was fetched
        if (menu) {
          this.menuName = menu.name;
          this.currentMenu.set({ id: menu.id, name: menu.name });
        }

        console.log(`📥 Loaded ${allActions.length} total actions from database`);
        console.log(`🎯 Filtering for menu: "${this.menuName}"${this.menuId ? ` (ID: ${this.menuId})` : ''}`);
        
        // If we have menuWithActions, filter actions by menu ID
        let actionsToCheck: MenuAction[] = allActions;
        if (menuWithActions && menuWithActions.actions) {
          const menuActionIds = new Set(menuWithActions.actions.map(a => a.id));
          actionsToCheck = allActions.filter(a => menuActionIds.has(a.id));
          console.log(`📋 Filtered to ${actionsToCheck.length} actions assigned to menu ID ${this.menuId}`);
        }
        
        // Show actions that have isShowInTopBar = true
        const topBarActions = actionsToCheck.filter(a => a.isShowInTopBar);
        console.log(`📊 ${topBarActions.length} actions have isShowInTopBar = true:`, topBarActions.map(a => a.name));
        
        // Filter actions: only show actions that are marked to show in top bar AND user has permission for
        const permittedActions = actionsToCheck.filter(action => {
          // First check if action should be shown in top bar
          if (!action.isShowInTopBar) {
            console.log(`⏭️ Action "${action.name}" skipped - isShowInTopBar = false`);
            return false;
          }
          
          // If menu ID is set, also check if action is assigned to this menu
          if (this.menuId && menuWithActions) {
            const isAssignedToMenu = menuWithActions.actions.some(a => a.id === action.id);
            if (!isAssignedToMenu) {
              console.log(`⏭️ Action "${action.name}" skipped - not assigned to menu ID ${this.menuId}`);
              return false;
            }
          }
          
          const hasPermission = this.permissionCheckService.hasPermission(this.menuName, action.name);
          
          // Debug logging - use the same logic as PermissionCheckService (DO NOT collapse underscores)
          const menuKey = this.menuName.toLowerCase()
            .replace(/\s+/g, '_')   // Replace spaces with underscore
            .replace(/-/g, '_')      // Replace hyphens with underscore (may create triple underscores)
            .replace(/\./g, '_');    // Replace dots with underscore
          const expectedKey = `${menuKey}_${action.name.toLowerCase()}`;
          
          if (!hasPermission) {
            console.log(`❌ Button "${action.name}" hidden - no permission for menu "${this.menuName}" (expected key: "${expectedKey}")`);
          } else {
            console.log(`✅ Button "${action.name}" shown - has permission for menu "${this.menuName}" (key: "${expectedKey}")`);
          }
          
          return hasPermission;
        });
        
        console.log(`📊 Final result: Showing ${permittedActions.length} of ${actionsToCheck.length} buttons for menu "${this.menuName}"`);
        
        return permittedActions.map((action) => this.mapMenuActionToButtonConfig(action));
      })
    );
  }

  /**
   * Map MenuAction to DynamicButtonConfig
   * Uses description as tooltip
   * Maps ActionColor to customColor
   * Maps IsSelected to isSelected flag
   */
  private mapMenuActionToButtonConfig(action: MenuAction): DynamicButtonConfig {
    // Determine variant based on action name (but will be overridden by customColor if present)
    const variant = this.getVariantForAction(action.name);
    
    return {
      label: action.name,
      action: action.name.toLowerCase().replace(/\s+/g, ''), // Convert "Delete Selected" to "deleteselected"
      variant: variant,
      icon: action.icon || this.getDefaultIconForAction(action.name),
      iconPosition: 'left',
      disabled: !action.isActive, // Will be updated by component based on selection if isSelected is true
      visible: action.isActive,
      tooltip: action.description || action.name, // Use description as tooltip, fallback to name
      size: 'md',
      showOnlyIcon: false,
      customColor: (action.actionColor && action.actionColor.trim() !== '') ? action.actionColor.trim() : undefined, // Map ActionColor to customColor - this will be used for button color
      isSelected: action.isSelected || false // Map IsSelected flag
    };
  }

  /**
   * Get variant (color/style) for action based on name
   */
  private getVariantForAction(actionName: string): DynamicButtonConfig['variant'] {
    const name = actionName.toLowerCase();
    
    if (name.includes('delete') || name.includes('remove') || name.includes('cancel')) {
      return 'danger';
    }
    if (name.includes('create') || name.includes('add') || name.includes('save')) {
      return 'primary';
    }
    if (name.includes('edit') || name.includes('update') || name.includes('modify')) {
      return 'primary';
    }
    if (name.includes('export') || name.includes('download')) {
      return 'outline';
    }
    if (name.includes('import') || name.includes('upload')) {
      return 'outline';
    }
    if (name.includes('duplicate') || name.includes('copy')) {
      return 'success';
    }
    
    return 'outline';
  }

  /**
   * Get default icon for action if not provided in database
   */
  private getDefaultIconForAction(actionName: string): string {
    const name = actionName.toLowerCase();
    
    const iconMap: Record<string, string> = {
      create: 'add',
      add: 'add',
      delete: 'delete',
      remove: 'delete',
      edit: 'edit',
      update: 'edit',
      save: 'save',
      cancel: 'cancel',
      export: 'export',
      download: 'export',
      import: 'import',
      upload: 'import',
      refresh: 'refresh',
      reload: 'refresh',
      print: 'print',
      duplicate: 'duplicate',
      copy: 'duplicate',
      approve: 'save',
      reject: 'cancel'
    };

    // Find matching icon
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    return 'add'; // Default icon
  }

  /**
   * Refresh menu actions from database
   */
  refreshMenuActions(): Observable<MenuAction[]> {
    this.isLoaded.set(false);
    this.menuActions.set([]);
    return this.loadMenuActions();
  }

  /**
   * Get cached menu actions (synchronous)
   */
  getCachedMenuActions(): MenuAction[] {
    return this.menuActions();
  }

  /**
   * Check if actions are loaded
   */
  areActionsLoaded(): boolean {
    return this.isLoaded();
  }

  /**
   * Check if actions are currently loading
   */
  areActionsLoading(): boolean {
    return this.isLoading();
  }
}
