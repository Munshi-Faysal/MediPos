import { Component, signal, computed, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';

import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SessionTimeoutService } from '../../../core/services/session-timeout.service';
import { MenuService } from '../../../core/services/menu.service';
import { PermissionCheckService } from '../../../core/services/permission-check.service';
import { SessionTimeoutWarningComponent } from '../session-timeout-warning.component';
import { TopBarComponent } from './top-bar.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';
import { SidebarMenuItem } from '../../../core/models/menu.model';

export interface MenuItem {
  id: string;
  label: string;
  route: string | null;
  icon: string;
  type: 'link' | 'dropdown';
  order: number;
  roles?: string[]; // Array of roles or ['*'] for all roles, ['default'] for fallback
  children?: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, SessionTimeoutWarningComponent, TopBarComponent, ConfirmationDialogComponent],
  template: `
    <div class="h-screen bg-background flex flex-col overflow-hidden">
    
    
      <!-- Top Bar -->
      <app-top-bar
        [companyName]="companyName"
        [sidebarCollapsed]="sidebarCollapsed()"
        (toggleMobileMenu)="toggleMobileMenu()"
        (toggleSidebar)="toggleSidebar()"
        (toggleNotifications)="toggleNotifications()"
        (searchChange)="onSearchChange($event)"
      ></app-top-bar>
    
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <aside
          class="bg-surface border-r border-border flex flex-col fixed lg:static inset-y-0 left-0 z-50 lg:z-auto"
          [class.w-64]="!sidebarCollapsed()"
          [class.w-16]="sidebarCollapsed()"
          [style.transform]="(!showMobileMenu() && isMobile()) ? 'translateX(-100%)' : 'translateX(0)'"
          [style.transition]="'transform 300ms ease-in-out'"
          >
          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto overscroll-contain">
            <div class="p-2 sm:p-3">
              <!-- Menu Loading State -->
              @if (isMenuLoading()) {
                <div class="space-y-2 p-2">
                  @for (i of [1,2,3,4,5]; track i) {
                    <div class="animate-pulse">
                      <div class="flex items-center gap-3 px-3 py-2">
                        <div class="w-5 h-5 bg-surface-variant rounded"></div>
                        @if (!sidebarCollapsed()) {
                          <div class="h-4 bg-surface-variant rounded w-24"></div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
    
              <!-- Menu Error State -->
              @if (menuLoadError() && !isMenuLoading()) {
                <div class="p-3">
                  <div class="text-center text-on-surface-variant">
                    <svg class="h-8 w-8 mx-auto mb-2 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    @if (!sidebarCollapsed()) {
                      <p class="text-xs text-error-500 mb-2">{{ menuLoadError() }}</p>
                    }
                    @if (!sidebarCollapsed()) {
                      <button
                        (click)="refreshMenu()"
                        class="text-xs text-primary-600 hover:text-primary-700 underline"
                        >
                        Retry
                      </button>
                    }
                  </div>
                </div>
              }
    
              <!-- Navigation Items -->
              @if (!isMenuLoading()) {
                <div class="space-y-1">
                  <!-- Dynamic Menu Items -->
                  @for (item of menuItems(); track item) {
                    <!-- Link Type -->
                    @if (item.type === 'link' && item.route) {
                      <a
                        [routerLink]="item.route"
                        (click)="isMobile() && closeMobileMenu()"
                        routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                        [routerLinkActiveOptions]="item.route === '/app/dashboard' ? { exact: true } : { exact: false }"
                        class="group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 min-h-[44px] sm:min-h-[40px]"
                        [class.justify-center]="sidebarCollapsed()"
                        [title]="sidebarCollapsed() ? item.label : ''"
                        >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
                        </svg>
                        @if (!sidebarCollapsed()) {
                          <span>{{ item.label }}</span>
                        }
                      </a>
                    }
                    <!-- Dropdown Type -->
                    @if (item.type === 'dropdown') {
                      <div class="">
                        <button
                          (click)="toggleMenuItem(item.id)"
                          class="group w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 min-h-[44px] sm:min-h-[40px]"
                          [class.justify-center]="sidebarCollapsed()"
                          [title]="sidebarCollapsed() ? item.label : ''"
                          [class.bg-primary-50]="isMenuItemActive(item)"
                          [class.text-primary-700]="isMenuItemActive(item)"
                          >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
                          </svg>
                          @if (!sidebarCollapsed()) {
                            <span>{{ item.label }}</span>
                          }
                          @if (!sidebarCollapsed()) {
                            <svg class="h-4 w-4 ml-auto transition-transform duration-200"
                              [class.rotate-90]="isMenuItemExpanded(item.id)"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          }
                        </button>
                        @if (!sidebarCollapsed() && isMenuItemExpanded(item.id) && item.children) {
                          <div class="ml-6 mt-1 space-y-1">
                            @for (child of item.children; track child) {
                              <a
                                [routerLink]="child.route!"
                                (click)="isMobile() && closeMobileMenu()"
                                routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                                class="group flex items-center gap-3 px-3 py-2 text-sm rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                                >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="child.icon"></path>
                                </svg>
                                <span>{{ child.label }}</span>
                              </a>
                            }
                          </div>
                        }
                      </div>
                    }
                  }
                  <!-- Empty Menu State -->
                  @if (menuItems().length === 0 && !menuLoadError()) {
                    <div class="p-3 text-center">
                      @if (!sidebarCollapsed()) {
                        <p class="text-xs text-on-surface-variant">No menu items available</p>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </nav>
        </aside>
    
        <!-- Mobile Overlay -->
        @if (showMobileMenu()) {
          <div
            class="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
            (click)="closeMobileMenu()"
            >
            <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          </div>
        }
    
        <!-- Main Content -->
        <main
          id="main-content"
          class="flex-1 overflow-y-auto focus:outline-none w-full lg:w-auto"
          >
          <!-- Loading Indicator -->
          @if (isLoading()) {
            <div class="fixed top-16 left-0 right-0 z-50">
              <div class="h-1 bg-primary-200">
                <div class="h-1 bg-primary-600 animate-pulse"></div>
              </div>
            </div>
          }
    
          <!-- Page Content -->
          <div class="p-3 sm:p-4 md:p-5 lg:p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    
      <!-- Footer -->
      <footer class="bg-surface border-t border-border flex-shrink-0">
        <div class="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div class="text-xs sm:text-sm text-on-surface-variant text-center sm:text-left">
              <p>&copy; {{ currentYear }} MediPOS. All rights reserved.</p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-on-surface-variant">
              <a href="#" class="hover:text-on-surface transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-on-surface transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-on-surface transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    
      <!-- Mobile Menu - Now handled by sidebar with overlay -->
    
      <!-- Notifications Panel -->
      @if (showNotifications()) {
        <div
          class="fixed top-14 sm:top-16 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-80 md:w-96 max-w-sm sm:max-w-md max-h-[calc(100vh-4rem)] sm:max-h-96 overflow-y-auto bg-surface border border-border rounded-lg shadow-strong overscroll-contain"
          >
          <!-- Notifications content will be implemented -->
          <div class="p-3 sm:p-4">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h3 class="text-base sm:text-lg font-semibold text-on-surface">Notifications</h3>
              <button
                (click)="showNotifications.set(false)"
                class="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Close notifications"
                >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-2">
              <div class="p-2 sm:p-3 bg-surface-variant rounded-md">
                <p class="text-xs sm:text-sm font-medium text-on-surface">No new notifications</p>
                <p class="text-xs text-on-surface-variant mt-1">You're all caught up!</p>
              </div>
            </div>
          </div>
        </div>
      }
    
      <!-- Session Timeout Warning -->
      <app-session-timeout-warning></app-session-timeout-warning>
    
      <!-- Confirmation Dialog -->
      <app-confirmation-dialog
        [isVisible]="confirmationDialogVisible()"
        [title]="confirmationDialogData()?.title || 'Confirm'"
        [message]="confirmationDialogData()?.message || 'Are you sure?'"
        [details]="confirmationDialogData()?.details || ''"
        [confirmText]="confirmationDialogData()?.confirmText || 'Confirm'"
        [cancelText]="confirmationDialogData()?.cancelText || 'Cancel'"
        (confirmed)="onDialogConfirmed($event)"
      ></app-confirmation-dialog>
    </div>
    `,
  styles: []
})
export class LayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  router = inject(Router);
  private themeService = inject(ThemeService);
  private sessionTimeoutService = inject(SessionTimeoutService);
  confirmationDialog = inject(ConfirmationDialogService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private menuService = inject(MenuService);
  private permissionCheckService = inject(PermissionCheckService);

  // Signals for reactive state management
  public sidebarCollapsed = signal(false);
  public showMobileMenu = signal(false);
  public showMobileSearch = signal(false);
  public showNotifications = signal(false);
  public showUserMenu = signal(false);
  public isLoading = signal(false);
  public isMenuLoading = signal(false);
  public menuLoadError = signal<string | null>(null);
  public confirmationDialogVisible = signal(false);
  public confirmationDialogData = signal<any>(null);
  public companyName = signal('MediPOS');
  public unreadCount = signal(3);
  public currentUser = signal<any>(null);
  public expandedUserManager = signal(false);
  public expandedBankAccount = signal(false);
  public expandedSettings = signal(false);
  public expandedMenuItems = signal<Set<string>>(new Set());
  public menuItems = signal<MenuItem[]>([]);
  public currentYear = new Date().getFullYear();
  private resizeListener?: () => void;
  private destroy$ = new Subject<void>();

  // Computed properties
  public isMobile = computed(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  public isDark = computed(() => this.themeService.isDark());

  constructor() {
    // Get current user
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    // Handle window resize - force change detection
    this.resizeListener = () => {
      if (window.innerWidth >= 1024) {
        this.showMobileMenu.set(false);
      }
      // Force change detection
      this.cdr.detectChanges();
    };
    window.addEventListener('resize', this.resizeListener);

    // Close menus when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        this.closeAllMenus();
      }
    });

    // Subscribe to confirmation dialog
    this.confirmationDialog.dialog$.subscribe(data => {
      if (data) {
        this.confirmationDialogData.set(data);
        this.confirmationDialogVisible.set(true);
      } else {
        this.confirmationDialogVisible.set(false);
      }
    });

    // Subscribe to user changes
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser.set(user);
      this.cdr.detectChanges(); // Force change detection when user updates

      // Only reload menu if user changed and we don't have menus yet
      // Don't reload on every user update to avoid clearing menu during token refresh
      if (user && this.menuItems().length === 0) {
        console.log('👤 User loaded, loading menu items...');
        this.loadMenuItems();
      }
    });
  }

  ngOnInit(): void {
    // Initialize permissions when layout loads (centralized permission loading)
    this.permissionCheckService.loadPermissions();

    // Ensure user is loaded from auth service
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
    }

    // Load menu items from JSON
    this.loadMenuItems();

    // Auto-expand menu items based on current route
    this.checkAndExpandMenus();

    // Listen for route changes to auto-expand menu items
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAndExpandMenus();
      });
  }

  loadMenuItems(): void {
    console.log('🔄 Starting to load menu items...');

    // Don't reload if already loading or if we have menu items
    if (this.isMenuLoading() || (this.menuItems().length > 0 && !this.menuLoadError())) {
      console.log('⏭️ Menu already loaded or loading, skipping...');
      return;
    }

    this.isMenuLoading.set(true);
    this.menuLoadError.set(null);

    // Load menu from database API (will wait for permissions and filter by view permissions)
    this.menuService.getSidebarMenus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sidebarMenus) => {
          console.log('📋 Received sidebar menus:', sidebarMenus?.length || 0, 'items');

          // Log children count for each menu
          sidebarMenus.forEach(menu => {
            if (menu.children && menu.children.length > 0) {
              console.log(`   Menu "${menu.label}" has ${menu.children.length} children:`, menu.children.map(c => c.label));
            }
          });

          // Map SidebarMenuItem to MenuItem format
          const menuItems = this.mapSidebarMenusToMenuItems(sidebarMenus);
          console.log('🗺️ Mapped to MenuItem format:', menuItems?.length || 0, 'items');

          // Log final menu structure with children
          menuItems.forEach(item => {
            if (item.children && item.children.length > 0) {
              console.log(`   ✅ Final Menu "${item.label}" (type: ${item.type}) has ${item.children.length} children:`, item.children.map(c => c.label));
            } else if (item.type === 'dropdown') {
              console.warn(`   ⚠️ Menu "${item.label}" is type 'dropdown' but has no children!`);
            }
          });

          // Sort by order
          const sortedItems = menuItems.sort((a, b) => a.order - b.order);
          this.menuItems.set(sortedItems);
          this.isMenuLoading.set(false);

          console.log('✅ Menu items loaded successfully:', sortedItems.length, 'items');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Failed to load menu from API:', error);
          console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
            url: error?.url,
            error: error
          });
          this.menuLoadError.set('Failed to load menu. Please try again.');
          this.isMenuLoading.set(false);

          // Fallback to static menu config if API fails
          console.log('🔄 Attempting to load fallback menu...');
          this.loadFallbackMenu();
        }
      });
  }

  /**
   * Load fallback menu from static JSON config
   */
  private loadFallbackMenu(): void {
    this.http.get<{ menuItems: MenuItem[] }>('./assets/menu.config.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const filteredItems = this.filterMenuItemsByRole(data.menuItems);
          const sortedItems = filteredItems.sort((a, b) => a.order - b.order);
          this.menuItems.set(sortedItems);
          this.menuLoadError.set(null); // Clear error since fallback worked
        },
        error: (fallbackError) => {
          console.error('Failed to load fallback menu:', fallbackError);
          this.menuItems.set([]);
        }
      });
  }

  /**
   * Map SidebarMenuItem to internal MenuItem format
   */
  private mapSidebarMenusToMenuItems(sidebarMenus: SidebarMenuItem[]): MenuItem[] {
    return sidebarMenus.map(menu => {
      // Recursively map children if they exist
      const mappedChildren = menu.children && menu.children.length > 0
        ? this.mapSidebarMenusToMenuItems(menu.children)
        : undefined;

      // Determine type: if it has children (even after mapping), it's a dropdown
      // Otherwise use the original type
      const finalType = (mappedChildren && mappedChildren.length > 0)
        ? 'dropdown'
        : (menu.type === 'dropdown' && !mappedChildren ? 'link' : menu.type);

      const menuItem: MenuItem = {
        id: menu.id,
        label: menu.label,
        route: menu.route,
        icon: menu.icon,
        type: finalType,
        order: menu.order,
        roles: menu.roles,
        children: mappedChildren && mappedChildren.length > 0 ? mappedChildren : undefined
      };

      // Debug logging for menus with children
      if (menu.children && menu.children.length > 0) {
        console.log(`🔄 Layout: Menu "${menu.label}" has ${menu.children.length} children, mapped to ${mappedChildren?.length || 0} children, type: ${menuItem.type}`);
        if (mappedChildren && mappedChildren.length > 0) {
          console.log(`   Mapped children:`, mappedChildren.map(c => c.label));
        } else {
          console.warn(`   ⚠️ All children were filtered out for menu "${menu.label}"`);
        }
      }

      return menuItem;
    });
  }

  /**
   * Refresh menu from API
   */
  refreshMenu(): void {
    this.menuService.refreshSidebarMenus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sidebarMenus) => {
          const menuItems = this.mapSidebarMenusToMenuItems(sidebarMenus);
          const sortedItems = menuItems.sort((a, b) => a.order - b.order);
          this.menuItems.set(sortedItems);
          this.menuLoadError.set(null);
        },
        error: (error) => {
          console.error('Failed to refresh menu:', error);
        }
      });
  }

  filterMenuItemsByRole(items: MenuItem[]): MenuItem[] {
    const userRole = this.getUserRole();
    const isSpecificRole = this.isSpecificRole();

    return items.filter(item => {
      // If no roles specified, include item
      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      // If roles includes '*', include for all
      if (item.roles.includes('*')) {
        return true;
      }

      // Check if user role matches
      if (item.roles.includes(userRole)) {
        return true;
      }

      // For 'default' role items, show only if user doesn't have a specific role
      if (item.roles.includes('default')) {
        return !isSpecificRole;
      }

      return false;
    }).map(item => {
      // Recursively filter children
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: this.filterMenuItemsByRole(item.children)
        };
      }
      return item;
    });
  }

  checkAndExpandMenus(): void {
    const url = this.router.url;
    const expanded = new Set(this.expandedMenuItems());

    // Check each menu item to see if any child route matches current URL
    this.menuItems().forEach(item => {
      if (item.type === 'dropdown' && item.children) {
        const hasActiveChild = item.children.some(child => {
          if (child.route) {
            return url === child.route || url.startsWith(child.route + '/');
          }
          return false;
        });

        if (hasActiveChild) {
          expanded.add(item.id);
        }
      } else if (item.route) {
        if (url === item.route || url.startsWith(item.route + '/')) {
          // For links, no need to expand
        }
      }
    });

    this.expandedMenuItems.set(expanded);

    // Legacy support for old expanded signals
    if (url.includes('/settings') || url.includes('/admin/settings')) {
      this.expandedSettings.set(true);
    }
    if (url.includes('/app/bank-account')) {
      this.expandedBankAccount.set(true);
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleMobileSearch(): void {
    this.showMobileSearch.set(!this.showMobileSearch());
  }

  toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
  }

  toggleUserMenu(): void {
    this.showUserMenu.set(!this.showUserMenu());
  }

  toggleUserManager(): void {
    this.expandedUserManager.set(!this.expandedUserManager());
  }

  toggleBankAccount(): void {
    this.expandedBankAccount.set(!this.expandedBankAccount());
  }

  toggleSettings(): void {
    this.expandedSettings.set(!this.expandedSettings());
  }

  toggleMenuItem(itemId: string): void {
    const expanded = this.expandedMenuItems();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }

    this.expandedMenuItems.set(newExpanded);
  }

  isMenuItemExpanded(itemId: string): boolean {
    return this.expandedMenuItems().has(itemId);
  }

  isMenuItemActive(item: MenuItem): boolean {
    if (item.type === 'link' && item.route) {
      return this.router.url === item.route || this.router.url.startsWith(item.route + '/');
    }
    if (item.type === 'dropdown' && item.children) {
      return item.children.some(child => this.isMenuItemActive(child));
    }
    return false;
  }

  navigateToSettings(page: string): void {
    // Close mobile menu if open
    if (this.isMobile()) {
      this.closeMobileMenu();
    }

    // Navigate to the admin settings page
    const targetUrl = `/admin/settings/${page}`;

    // Use router.navigateByUrl for more reliable navigation
    this.router.navigateByUrl(targetUrl)
      .then(success => {
        if (!success) {
          console.error(`Failed to navigate to ${targetUrl}`);
          // Check if it's a permission issue
          const user = this.currentUser();
          const hasAdminAccess = user && this.authService.hasAnyRole(['Admin', 'SuperAdmin']);
          if (!hasAdminAccess) {
            console.warn('Access denied: User does not have Admin or SuperAdmin role.');
          }
        }
      })
      .catch(error => {
        console.error(`Navigation error to ${targetUrl}:`, error);
      });
  }

  navigateToAdminSettings(page: string): void {
    // Close mobile menu if open
    if (this.isMobile()) {
      this.closeMobileMenu();
    }

    // Navigate to the admin settings page - allow all authenticated users
    const targetUrl = `/admin/settings/${page}`;

    // Navigate directly - access control removed
    this.router.navigateByUrl(targetUrl)
      .then(success => {
        if (!success) {
          console.error(`Navigation was rejected to ${targetUrl}`);
        }
      })
      .catch(error => {
        console.error(`Navigation error to ${targetUrl}:`, error);
      });
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  closeAllMenus(): void {
    this.showMobileMenu.set(false);
    this.showMobileSearch.set(false);
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
  }

  logout(): void {
    // Use logout with confirmation
    this.authService.logoutWithConfirmation().subscribe(confirmed => {
      if (confirmed) {
        this.closeAllMenus();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onLogoutCompleted(success: boolean): void {
    if (success) {
      this.closeAllMenus();
      this.router.navigate(['/auth/login']);
    }
  }

  onSearchChange(query: string): void {
    // Handle search functionality
    console.log('Search query:', query);
  }

  onDialogConfirmed(result: boolean): void {
    this.confirmationDialog.confirm(result);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';

    const firstName = user.userFName || '';
    const lastName = user.userLName || '';

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.userName) {
      return user.userName.charAt(0).toUpperCase();
    }

    return 'U';
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'User';

    if (user.userFName && user.userLName) {
      return `${user.userFName} ${user.userLName}`;
    } else if (user.userFName) {
      return user.userFName;
    } else if (user.userName) {
      return user.userName;
    }

    return 'User';
  }

  getUserRole(): string {
    const user = this.currentUser();
    if (!user || !user.roles || user.roles.length === 0) return 'Employee';

    // Return the first role or the highest priority role
    return user.roles[0] || 'Employee';
  }

  isSpecificRole(): boolean {
    const role = this.getUserRole();
    // Check if the role matches any of the specific roles that have dedicated menu items
    const specificRoles = ['Relationship Manager', 'Head Office', 'Production', 'Branch'];
    return specificRoles.includes(role);
  }
}


