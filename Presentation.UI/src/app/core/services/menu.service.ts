import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of, BehaviorSubject, filter, delay, retry, timer, switchMap, take, timeout, race } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import { Menu, MenuListItem, CreateMenuRequest, UpdateMenuRequest, SidebarMenuItem, SidebarMenu, UIMenu, MenuInit } from '../models/menu.model';
import { PermissionCheckService } from './permission-check.service';

/**
 * Menu Service for managing menus
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private api = inject(ApiService);

  private readonly endpoint = '/Menu';
  private permissionCheckService = inject(PermissionCheckService);

  // Cache for sidebar menus
  private sidebarMenusCache$ = new BehaviorSubject<SidebarMenuItem[] | null>(null);
  private isLoadingMenus$ = new BehaviorSubject<boolean>(false);
  private menuLoadError$ = new BehaviorSubject<string | null>(null);

  constructor() {
    // Initialize permissions when service is created
    this.permissionCheckService.loadPermissions();
  }

  /**
   * Get all menus from database (matching UI project API)
   * Calls /Menu/GetAll endpoint
   */
  getAllMenus(): Observable<UIMenu[]> {
    return this.api.get<UIMenu[]>(`${this.endpoint}/GetAll`);
  }

  /**
   * Get paginated list of menus (legacy method - kept for backward compatibility)
   * Supports search, sorting, and filtering
   */
  getMenus(params: PaginationParams & {
    isActive?: boolean;
    parentId?: string;
  } = {}): Observable<PagedResponse<MenuListItem>> {
    return this.api.getPaginated<MenuListItem>(this.endpoint, params);
  }

  /**
   * Get menu by encrypted ID (matching UI project API)
   * Calls /Menu/GetById/{encryptedId} endpoint
   */
  getMenuByEncryptedId(encryptedId: string): Observable<UIMenu> {
    return this.api.get<UIMenu>(`${this.endpoint}/GetById/${encryptedId}`);
  }

  /**
   * Get menu initialization data (matching UI project API)
   * Calls /Menu/Init/{encryptedId} endpoint
   */
  getMenuInit(encryptedId: string): Observable<MenuInit> {
    const id = encryptedId.trim().length > 0 ? encryptedId : 'NA';
    return this.api.get<MenuInit>(`${this.endpoint}/Init/${id}`);
  }

  /**
   * Get menu by ID (legacy method - kept for backward compatibility)
   */
  getMenuById(id: string): Observable<Menu> {
    return this.api.get<Menu>(`${this.endpoint}/${id}`);
  }

  /**
   * Get menus by parent ID
   */
  getMenusByParentId(parentId: string): Observable<Menu[]> {
    return this.api.get<Menu[]>(`${this.endpoint}/parent/${parentId}`);
  }

  /**
   * Get root menus (menus without parent)
   */
  getRootMenus(): Observable<Menu[]> {
    return this.api.get<Menu[]>(`${this.endpoint}/root`);
  }

  /**
   * Get menu by route path
   * @param route The route path to match (e.g., '/admin/bank-account/all')
   * @returns Observable of Menu or null if not found
   */
  getMenuByRoute(route: string): Observable<Menu | null> {
    return this.getMenus({ 
      page: 1, 
      pageSize: 1000,
      isActive: true
    }).pipe(
      map(response => {
        // Try exact match first
        let menu = response.data.find(m => m.route === route);
        
        // If no exact match, try matching the end of the route
        if (!menu) {
          menu = response.data.find(m => {
            if (!m.route) return false;
            // Check if route ends with the menu route or vice versa
            return route.endsWith(m.route) || m.route.endsWith(route);
          });
        }
        
        // If still no match, try partial match
        if (!menu) {
          const routeParts = route.split('/').filter(p => p);
          menu = response.data.find(m => {
            if (!m.route) return false;
            const menuRouteParts = m.route.split('/').filter(p => p);
            // Check if last part matches
            return routeParts.length > 0 && 
                   menuRouteParts.length > 0 && 
                   routeParts[routeParts.length - 1] === menuRouteParts[menuRouteParts.length - 1];
          });
        }
        
        return menu || null;
      }),
      catchError(error => {
        console.error('Error getting menu by route:', error);
        return of(null);
      })
    );
  }

  /**
   * Create a new menu (matching UI project API)
   * Calls /Menu/Create endpoint
   */
  createMenuFromDB(menu: any): Observable<boolean> {
    return this.api.post<boolean>(`${this.endpoint}/Create`, menu);
  }

  /**
   * Update an existing menu (matching UI project API)
   * Calls /Menu/Edit endpoint
   */
  updateMenuFromDB(menu: UIMenu): Observable<boolean> {
    return this.api.put<boolean>(`${this.endpoint}/Edit`, menu);
  }

  /**
   * Create a new menu (legacy method - kept for backward compatibility)
   */
  createMenu(menu: CreateMenuRequest): Observable<Menu> {
    return this.api.post<Menu>(this.endpoint, menu);
  }

  /**
   * Update an existing menu (legacy method - kept for backward compatibility)
   */
  updateMenu(id: string, menu: UpdateMenuRequest): Observable<Menu> {
    return this.api.put<Menu>(`${this.endpoint}/${id}`, menu);
  }

  /**
   * Delete a menu
   */
  deleteMenu(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a menu
   */
  activateMenu(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a menu
   */
  deactivateMenu(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Get menu statistics (for dashboard cards)
   */
  getMenuStatistics(): Observable<{
    totalMenus: number;
    activeMenus: number;
    rootMenus: number;
    childMenus: number;
  }> {
    return new Observable(observer => {
      this.getMenus({ page: 1, pageSize: 1000 }).subscribe({
        next: (response) => {
          const menus = response.data;
          const statistics = {
            totalMenus: response.totalCount,
            activeMenus: menus.filter(m => m.isActive).length,
            rootMenus: menus.filter(m => !m.parentId).length,
            childMenus: menus.filter(m => m.parentId).length
          };
          observer.next(statistics);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get user menus from API (matching Workflow.Presentation.UI)
   * Calls /Menu/GetUserMenus endpoint
   */
  getUserMenus(): Observable<SidebarMenu[]> {
    return this.api.get<SidebarMenu[]>(`${this.endpoint}/GetUserMenus`);
  }

  /**
   * Get all menus and build hierarchical structure for sidebar
   * This is the main method used by the layout component
   * Now uses GetUserMenus API endpoint (matching UI project)
   */
  getSidebarMenus(): Observable<SidebarMenuItem[]> {
    // Return cached data if available
    const cached = this.sidebarMenusCache$.getValue();
    if (cached && cached.length > 0) {
      return of(cached);
    }

    // If already loading, return the current loading observable
    if (this.isLoadingMenus$.getValue()) {
      return this.sidebarMenusCache$.pipe(
        filter(menus => menus !== null),
        take(1),
        map(menus => menus || [])
      );
    }

    this.isLoadingMenus$.next(true);
    this.menuLoadError$.next(null);

    // Call GetUserMenus API (matching UI project)
    return this.getUserMenus().pipe(
      map((menus: SidebarMenu[]) => {
        if (!menus || menus.length === 0) {
          this.sidebarMenusCache$.next([]);
          this.isLoadingMenus$.next(false);
          return [];
        }
        
        // Build hierarchical structure from flat list
        const hierarchicalMenus = this.buildMenuHierarchyFromSidebarMenus(menus);
        
        // Map to SidebarMenuItem format
        const sidebarMenus = this.mapSidebarMenusToSidebarMenuItems(hierarchicalMenus);
        
        // Cache the result
        this.sidebarMenusCache$.next(sidebarMenus);
        this.isLoadingMenus$.next(false);
        
        return sidebarMenus;
      }),
      catchError(error => {
        console.error('❌ Error loading sidebar menus:', error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.status,
          statusText: error?.statusText,
          url: error?.url,
          error: error
        });
        
        // If it's a 401 error, don't cache empty array - let it retry after token refresh
        if (error?.status === 401) {
          this.menuLoadError$.next('Authentication required. Please login again.');
          // Clear cache so it can retry after token refresh
          this.sidebarMenusCache$.next(null);
        } else {
          this.menuLoadError$.next('Failed to load menu. Please try again.');
          // For other errors, cache empty array to prevent infinite retries
          this.sidebarMenusCache$.next([]);
        }
        
        this.isLoadingMenus$.next(false);
        // Return empty array
        return of([]);
      })
    );
  }

  /**
   * Force refresh sidebar menus (clears cache)
   * Only use this when explicitly needed (e.g., after permission changes)
   */
  refreshSidebarMenus(): Observable<SidebarMenuItem[]> {
    this.sidebarMenusCache$.next(null);
    this.isLoadingMenus$.next(false); // Reset loading state
    return this.getSidebarMenus();
  }

  /**
   * Get loading state observable
   */
  getLoadingState(): Observable<boolean> {
    return this.isLoadingMenus$.asObservable();
  }

  /**
   * Get error state observable
   */
  getErrorState(): Observable<string | null> {
    return this.menuLoadError$.asObservable();
  }

  /**
   * Build hierarchical menu structure from flat list
   */
  private buildMenuHierarchy(flatMenus: MenuListItem[]): MenuListItem[] {
    // Create a map for quick lookup
    const menuMap = new Map<string, MenuListItem>();
    flatMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Separate root menus and assign children
    const rootMenus: MenuListItem[] = [];

    flatMenus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id)!;
      
      if (!menu.parentId) {
        rootMenus.push(menuWithChildren);
      } else {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(menuWithChildren);
        }
      }
    });

    // Sort root menus and children by order/priority
    this.sortMenus(rootMenus);
    
    return rootMenus;
  }

  /**
   * Sort menus recursively by order/priority
   */
  private sortMenus(menus: MenuListItem[]): void {
    menus.sort((a, b) => {
      const orderA = a.order ?? a.priority ?? 0;
      const orderB = b.order ?? b.priority ?? 0;
      return orderA - orderB;
    });

    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        this.sortMenus(menu.children);
      }
    });
  }

  /**
   * Map API Menu items to SidebarMenuItem format
   */
  private mapToSidebarMenuItems(menus: MenuListItem[]): SidebarMenuItem[] {
    return menus.map(menu => this.mapMenuToSidebarItem(menu));
  }

  /**
   * Map a single Menu to SidebarMenuItem
   */
  private mapMenuToSidebarItem(menu: MenuListItem): SidebarMenuItem {
    const hasChildren = menu.children && menu.children.length > 0;
    
    // Recursively map children if they exist
    const mappedChildren = hasChildren 
      ? menu.children!.map(child => this.mapMenuToSidebarItem(child))
      : undefined;
    
    // Determine type: if it has children (even after mapping), it's a dropdown
    const shouldBeDropdown = (mappedChildren && mappedChildren.length > 0) || 
                             menu.isExpandable || 
                             menu.type === 'dropdown';
    
    const sidebarItem: SidebarMenuItem = {
      id: menu.id,
      label: menu.label || menu.name,
      route: menu.route || null,
      icon: this.getIconPath(menu.icon),
      type: shouldBeDropdown ? 'dropdown' : 'link',
      order: menu.order ?? menu.priority ?? 0,
      children: mappedChildren && mappedChildren.length > 0 ? mappedChildren : undefined
    };
    return sidebarItem;
  }

  /**
   * Map icon names to SVG paths
   * If the icon is already an SVG path (starts with 'M'), return as is
   * Otherwise, look up in the icon map
   */
  private getIconPath(iconName?: string): string {
    if (!iconName) {
      return 'M4 6h16M4 12h16M4 18h16'; // Default menu icon
    }

    // If already an SVG path, return as is
    if (iconName.startsWith('M') || iconName.startsWith('m')) {
      return iconName;
    }

    // Icon name to SVG path mapping
    const iconMap: Record<string, string> = {
      // Navigation
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'dashboard': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      'menu': 'M4 6h16M4 12h16M4 18h16',
      
      // Users & Auth
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'person': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'people': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'group': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'account_circle': 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'security': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'lock': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'key': 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      
      // Settings
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'tune': 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
      'build': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35',
      
      // Data & Content
      'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      'file': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'document': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'description': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'article': 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      'list': 'M4 6h16M4 10h16M4 14h16M4 18h16',
      'view_list': 'M4 6h16M4 10h16M4 14h16M4 18h16',
      'table': 'M3 10h18M3 14h18M3 18h18M3 6h18',
      
      // Business
      'business': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'store': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      'shopping_cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      'payment': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'receipt': 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
      'inventory': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      'category': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'box': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      
      // Reports & Analytics
      'analytics': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'bar_chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'pie_chart': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
      'trending_up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'assessment': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      
      // Communication
      'email': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'message': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      'notifications': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'chat': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      
      // Time
      'schedule': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'history': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      
      // Finance
      'attach_money': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'monetization_on': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'account_balance': 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      'credit_card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'bank': 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      
      // Misc
      'info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'help': 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'favorite': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      'bookmark': 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
      'flag': 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
      'label': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      'add': 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      'edit': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      'delete': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'check': 'M5 13l4 4L19 7',
      'close': 'M6 18L18 6M6 6l12 12',
      'arrow_right': 'M14 5l7 7m0 0l-7 7m7-7H3',
      'arrow_left': 'M10 19l-7-7m0 0l7-7m-7 7h18',
      'chevron_right': 'M9 5l7 7-7 7',
      'chevron_left': 'M15 19l-7-7 7-7',
      'chevron_down': 'M19 9l-7 7-7-7',
      'chevron_up': 'M5 15l7-7 7 7',
      
      // Approval states (matching your current icons)
      'approved': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'reject': 'M6 18L18 6M6 6l12 12',
      'revart': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'all': 'M4 6h16M4 12h16M4 18h16',
      'process': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    };

    // Try to find icon by name (case insensitive)
    const lowerName = iconName.toLowerCase().replace(/[_-]/g, '_');
    return iconMap[lowerName] || iconMap['menu'];
  }

  /**
   * Filter menus based on view permissions
   * Only show menus that user has "View" permission for
   * If a parent menu has children, show the parent if ANY child has view permission
   * This method is called after permissions are loaded, so we can safely filter
   * 
   * Logic:
   * - For menus with children: Show parent if parent has view permission OR any child has view permission
   * - For menus without children: Only show if user has view permission
   * - This ensures parent menus (like "Settings") are visible when any submenu is accessible
   */
  private filterMenusByViewPermission(menus: MenuListItem[]): MenuListItem[] {
    return menus.filter(menu => {
      // IMPORTANT: Use menu.name (not label) for permission checking
      // Backend creates permission keys using menu.Name, not menu.Label
      // Example: menu.Name = "Settings Users" → permission key = "settings_users_view"
      //          menu.Label = "Users" → would create "users_view" (WRONG - doesn't match backend)
      const menuName = menu.name; // Use name, not label, to match backend permission key format
      const hasViewPermission = this.permissionCheckService.hasViewPermission(menuName);
      
      // Debug logging - show what permission key is being checked
      // Use the same logic as PermissionCheckService.createMenuKey() for accurate debugging
      if (!hasViewPermission) {
        const menuKey = menuName.toLowerCase()
          .replace(/[\s\-\.]+/g, '_')  // Replace spaces, hyphens, and dots together as one unit
          .replace(/_+/g, '_')          // Collapse multiple consecutive underscores to single
          .replace(/^_|_$/g, '');       // Remove leading/trailing underscores
        const expectedPermissionKey = `${menuKey}_view`;
        const availablePermissions = this.permissionCheckService.getUserPermissions();
        
        // Find permissions that match the menu name pattern
        const menuKeyPattern = menuKey.toLowerCase();
        const matchingPermissions = availablePermissions.filter(p => {
          const permLower = p.toLowerCase();
          return permLower.includes(menuKeyPattern) || 
                 permLower.includes(menuName.toLowerCase().replace(/\s+/g, '_')) ||
                 permLower.includes(menuName.toLowerCase().replace(/-/g, '_'));
        });
        
       
      
      }
      
      // If menu has children, filter them recursively first
      if (menu.children && menu.children.length > 0) {
        // Filter children recursively - this will return only children with view permission
        const filteredChildren = this.filterMenusByViewPermission(menu.children);
        
        // Update menu children to only include visible ones
        menu.children = filteredChildren;
        
        // Show parent menu if:
        // 1. At least one child has view permission (filteredChildren.length > 0), OR
        // 2. Parent itself has view permission
        // This handles cases where multiple submenus have view permission - parent will be shown
        const shouldShowParent = filteredChildren.length > 0 || hasViewPermission;
        
       
        
        return shouldShowParent;
      }

      // Menu has no children - only show if user has view permission
      return hasViewPermission;
    });
  }

  /**
   * Build hierarchical menu structure from SidebarMenu[] (flat list)
   * Converts from UI project's SidebarMenu format to hierarchical structure
   */
  private buildMenuHierarchyFromSidebarMenus(flatMenus: SidebarMenu[]): SidebarMenu[] {
    // Create a map for quick lookup
    const menuMap = new Map<number, SidebarMenu & { children?: SidebarMenu[] }>();
    flatMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Separate root menus and assign children
    const rootMenus: (SidebarMenu & { children?: SidebarMenu[] })[] = [];

    flatMenus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id)!;
      
      if (!menu.parentMenuId) {
        rootMenus.push(menuWithChildren);
      } else {
        const parent = menuMap.get(menu.parentMenuId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(menuWithChildren);
        }
      }
    });

    return rootMenus;
  }

  /**
   * Map SidebarMenu[] to SidebarMenuItem[] format
   */
  private mapSidebarMenusToSidebarMenuItems(menus: (SidebarMenu & { children?: SidebarMenu[] })[]): SidebarMenuItem[] {
    return menus.map(menu => this.mapSidebarMenuToSidebarMenuItem(menu));
  }

  /**
   * Map a single SidebarMenu to SidebarMenuItem
   */
  private mapSidebarMenuToSidebarMenuItem(menu: SidebarMenu & { children?: SidebarMenu[] }): SidebarMenuItem {
    const hasChildren = menu.children && menu.children.length > 0;
    
    // Recursively map children if they exist
    const mappedChildren = hasChildren 
      ? menu.children!.map(child => this.mapSidebarMenuToSidebarMenuItem(child))
      : undefined;
    
    // Determine type: if it has children, it's a dropdown
    const shouldBeDropdown = (mappedChildren && mappedChildren.length > 0);
    
    const sidebarItem: SidebarMenuItem = {
      id: menu.id.toString(),
      label: menu.menuName,
      route: menu.menuPath || null,
      icon: this.getIconPath(menu.menuIcon),
      type: shouldBeDropdown ? 'dropdown' : 'link',
      order: menu.id, // Use id as order if no order field
      children: mappedChildren && mappedChildren.length > 0 ? mappedChildren : undefined
    };
    return sidebarItem;
  }

  /**
   * Clear menu cache
   */
  clearCache(): void {
    this.sidebarMenusCache$.next(null);
  }
}

