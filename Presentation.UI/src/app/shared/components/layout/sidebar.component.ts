import { Component, Input, Output, EventEmitter, signal, computed, OnInit, inject } from '@angular/core';

import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
  roles?: string[];
  section?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside
      class="bg-surface border-r border-border h-full transition-all duration-300 ease-in-out"
      [class.w-64]="!collapsed"
      [class.w-16]="collapsed"
      >
      <!-- Sidebar Header - Removed logo as requested -->
    
      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto">
        <div class="p-2">
          <!-- Navigation Sections -->
          @for (section of getNavigationSections(); track section) {
            <!-- Section Header -->
            @if (!collapsed) {
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{{ section.name }}</h3>
              </div>
            }
            <!-- Section Items -->
            <div class="space-y-1 mb-4">
              @for (item of section.items; track item) {
                <!-- Single Item -->
                @if (!item.children) {
                  <div>
                    <a
                      [routerLink]="item.route"
                      routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                      [routerLinkActiveOptions]="{ exact: true }"
                      class="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200"
                      [class.justify-center]="collapsed"
                      [title]="collapsed ? item.label : ''"
                      >
                      <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.icon)"></path>
                      </svg>
                      @if (!collapsed) {
                        <span class="truncate">{{ item.label }}</span>
                      }
                      @if (!collapsed && item.badge && item.badge > 0) {
                        <span
                          class="ml-auto bg-error-500 text-white text-xs rounded-full px-2 py-0.5 font-medium"
                          >
                          {{ item.badge > 99 ? '99+' : item.badge }}
                        </span>
                      }
                    </a>
                  </div>
                }
                <!-- Dropdown Item -->
                @if (item.children) {
                  <div class="space-y-1">
                    <button
                      (click)="toggleDropdown(item.label)"
                      class="group w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200"
                      [class.justify-center]="collapsed"
                      [title]="collapsed ? item.label : ''"
                      >
                      <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.icon)"></path>
                      </svg>
                      @if (!collapsed) {
                        <span class="truncate flex-1 text-left">{{ item.label }}</span>
                      }
                      @if (!collapsed) {
                        <svg
                          class="h-4 w-4 transition-transform duration-200"
                          [class.rotate-90]="expandedDropdowns().includes(item.label)"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      }
                    </button>
                    <!-- Dropdown Content -->
                    @if (!collapsed && expandedDropdowns().includes(item.label)) {
                      <div
                        class="ml-6 space-y-1"
                        >
                        @for (child of item.children; track child) {
                          <a
                            [routerLink]="child.route"
                            routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                            class="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200"
                            >
                            <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(child.icon)"></path>
                            </svg>
                            <span class="truncate">{{ child.label }}</span>
                            @if (child.badge && child.badge > 0) {
                              <span
                                class="ml-auto bg-error-500 text-white text-xs rounded-full px-2 py-0.5 font-medium"
                                >
                                {{ child.badge > 99 ? '99+' : child.badge }}
                              </span>
                            }
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              }
            </div>
          }
    
          <!-- Divider -->
          <div class="my-4 border-t border-border"></div>
    
          <!-- Quick Actions -->
          @if (!collapsed) {
            <div class="space-y-1">
              <h3 class="px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Quick Actions</h3>
              @for (action of quickActions(); track action) {
                <button
                  (click)="onQuickAction(action.route)"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200"
                  >
                  <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(action.icon)"></path>
                  </svg>
                  <span class="truncate">{{ action.label }}</span>
                </button>
              }
            </div>
          }
        </div>
      </nav>
    
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-border">
        <div class="flex items-center gap-3" [class.justify-center]="collapsed">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {{ userInitials() }}
          </div>
          @if (!collapsed) {
            <div class="min-w-0">
              <p class="text-sm font-medium text-on-surface truncate">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</p>
              <p class="text-xs text-on-surface-variant truncate">{{ currentUser()?.role }}</p>
            </div>
          }
        </div>
      </div>
    </aside>
    `,
  styles: []
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() collapsed = false;
  @Input() companyName = signal('TechCorp Inc.');
  @Input() navigationItems: NavigationItem[] = [];

  @Output() quickAction = new EventEmitter<string>();

  public expandedDropdowns = signal<string[]>([]);
  public currentUser = signal<any>(null);

  ngOnInit(): void {
    // Initialize current user
    this.currentUser.set(this.authService.getCurrentUser());
    
    // Subscribe to user changes
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser.set(user);
    });
  }

  public getNavigationSections(): { name: string; items: NavigationItem[] }[] {
    // Navigation is now handled dynamically by MenuService in layout component
    // This method returns empty array as fallback
    return [
      {
        name: 'global',
        items: []
      }
    ];
  }

  public quickActions = computed(() => {
    // Quick actions for prescription management
    return [
      { label: 'New Prescription', icon: 'document', route: '/doctor/prescriptions/new' }
    ];
  });

  public userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  });

  toggleDropdown(label: string): void {
    const expanded = this.expandedDropdowns();
    if (expanded.includes(label)) {
      this.expandedDropdowns.set(expanded.filter(item => item !== label));
    } else {
      this.expandedDropdowns.set([...expanded, label]);
    }
  }

  onQuickAction(route: string): void {
    this.quickAction.emit(route);
    this.router.navigate([route]);
  }


  getIconPath(iconName: string): string {
    const iconPaths: Record<string, string> = {
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'lock': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'menu': 'M4 6h16M4 12h16M4 18h16',
      'user-md': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z M8 21v-5a2 2 0 012-2h4a2 2 0 012 2v5',
      'percent': 'M9 7h6m-6 4h6m-2 5h2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'target': 'M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'truck': 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
      'box': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'document': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    };
    return iconPaths[iconName] || iconPaths['document'];
  }

}

