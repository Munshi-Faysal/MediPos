import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { RouterModule, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopBarComponent } from '../../../shared/components/layout/top-bar.component';

export interface MenuItem {
  id: string;
  label: string;
  route: string | null;
  icon: string;
  type: 'link' | 'dropdown';
  order: number;
  children?: MenuItem[];
}

@Component({
  selector: 'app-system-admin-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, TopBarComponent],
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
              <!-- Navigation Items -->
              <div class="space-y-1">
                <!-- Dynamic Menu Items -->
                @for (item of menuItems(); track item.id) {
                  <!-- Link Type -->
                  @if (item.type === 'link' && item.route) {
                    <a
                      [routerLink]="item.route"
                      routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                      [routerLinkActiveOptions]="item.route === '/system-admin' ? { exact: true } : { exact: false }"
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
                        type="button"
                        (click)="toggleMenuItem(item.id)"
                        class="group w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200"
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
                          <svg class="h-4 w-4 ml-auto transition-transform duration-200" 
                               [class.rotate-90]="isMenuItemExpanded(item.id)"
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        }
                      </button>

                      @if (!sidebarCollapsed() && isMenuItemExpanded(item.id) && item.children) {
                        <div class="ml-6 mt-1 space-y-1">
                          @for (child of item.children; track child.id) {
                            <a
                              [routerLink]="child.route!"
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
              </div>
            </div>
          </nav>
        </aside>

        <!-- Mobile Overlay -->
        @if (showMobileMenu()) {
          <div
            class="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
            (click)="closeMobileMenu()"
            (keydown.escape)="closeMobileMenu()"
            tabindex="0"
            role="button"
            aria-label="Close mobile menu"
          >
            <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          </div>
        }

        <!-- Main Content -->
        <main
          id="main-content"
          class="flex-1 overflow-y-auto focus:outline-none w-full lg:w-auto"
        >
          <!-- Page Content -->
          <div class="p-3 sm:p-4 md:p-5 lg:p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class SystemAdminLayoutComponent implements OnInit {
  private router = inject(Router);

  public sidebarCollapsed = signal(false);
  public showMobileMenu = signal(false);
  public companyName = signal('System Administration');
  public expandedMenuItems = signal<Set<string>>(new Set());
  public menuItems = signal<MenuItem[]>([]);

  public isMobile = computed(() => window.innerWidth < 1024);

  constructor() {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        this.showMobileMenu.set(false);
      }
      // Force change detection by accessing the computed signal
      this.isMobile();
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
    this.checkAndExpandMenuItems();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAndExpandMenuItems();
      });
  }

  loadMenuItems(): void {
    const menu: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/system-admin',
        icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
        type: 'link',
        order: 1
      },
      {
        id: 'onboarding',
        label: 'Onboarding',
        route: '/system-admin/onboarding',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        type: 'link',
        order: 2
      },
      {
        id: 'drug-management',
        label: 'Drugs Management',
        route: null,
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        type: 'dropdown',
        order: 3,
        children: [
          {
            id: 'drug-company',
            label: 'Company',
            route: '/system-admin/drugs/company',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            type: 'link',
            order: 1
          },
          {
            id: 'drug-generic',
            label: 'Generic',
            route: '/system-admin/drugs/generic',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            type: 'link',
            order: 2
          },
          {
            id: 'drug-strength',
            label: 'Drug Strength',
            route: '/system-admin/drugs/strength',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            type: 'link',
            order: 3
          },
          {
            id: 'drug-type',
            label: 'Drug Type',
            route: '/system-admin/drugs/type',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            type: 'link',
            order: 4
          },
          {
            id: 'drug-list',
            label: 'Drugs',
            route: '/system-admin/drugs/list',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            type: 'link',
            order: 5
          }
        ]
      },
      {
        id: 'packages',
        label: 'Packages',
        route: '/system-admin/packages',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        type: 'link',
        order: 4
      }
    ];
    this.menuItems.set(menu);
  }

  checkAndExpandMenuItems(): void {
    const currentUrl = this.router.url;
    const expanded = new Set(this.expandedMenuItems());

    this.menuItems().forEach(item => {
      if (item.type === 'dropdown' && item.children) {
        const hasActiveChild = item.children.some(child =>
          child.route && currentUrl.startsWith(child.route)
        );
        if (hasActiveChild) {
          expanded.add(item.id);
        }
      }
    });

    this.expandedMenuItems.set(expanded);
  }

  toggleMenuItem(itemId: string): void {
    const expanded = new Set(this.expandedMenuItems());
    if (expanded.has(itemId)) {
      expanded.delete(itemId);
    } else {
      expanded.add(itemId);
    }
    this.expandedMenuItems.set(expanded);
  }

  isMenuItemExpanded(itemId: string): boolean {
    return this.expandedMenuItems().has(itemId);
  }

  isMenuItemActive(item: MenuItem): boolean {
    if (item.type === 'dropdown' && item.children) {
      const currentUrl = this.router.url;
      return item.children.some(child =>
        child.route && currentUrl.startsWith(child.route)
      );
    }
    return false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleNotifications(): void {
    // Handle notifications
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  onSearchChange(query: string): void {
    // Handle search
    console.log('Search query:', query);
  }
}

