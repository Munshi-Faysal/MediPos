import { Component, signal, computed, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SessionTimeoutService } from '../../../core/services/session-timeout.service';
import { SessionTimeoutWarningComponent } from '../../../shared/components/session-timeout-warning.component';
import { TopBarComponent } from '../../../shared/components/layout/top-bar.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';

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
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SessionTimeoutWarningComponent, TopBarComponent, ConfirmationDialogComponent],
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
          class="bg-surface border-r border-border flex flex-col fixed lg:static inset-y-0 left-0 z-50 lg:z-auto top-14 xs:top-14 sm:top-16 lg:top-auto h-[calc(100vh-3.5rem)] xs:h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-auto transition-transform duration-300 ease-in-out"
          data-menu
          [class.w-56]="!sidebarCollapsed()"
          [class.w-16]="sidebarCollapsed()"
          [ngStyle]="{
            'transform': isMobile() && !showMobileMenu() ? 'translateX(-100%)' : 'translateX(0)',
            'width': isMobile() ? (sidebarCollapsed() ? '64px' : '224px') : 'auto',
            'pointerEvents': isMobile() && !showMobileMenu() ? 'none' : 'auto'
          }"
          >
          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto overscroll-contain">
            <div class="p-1 xs:p-2 sm:p-3">
              <!-- Navigation Items -->
              <div class="space-y-0.5 xs:space-y-1">
                <!-- Dynamic Menu Items -->
                @for (item of menuItems(); track item) {
                  <!-- Link Type -->
                  @if (item.type === 'link' && item.route) {
                    <a
                      [routerLink]="item.route"
                      (click)="isMobile() && closeMobileMenu()"
                      routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                      [routerLinkActiveOptions]="item.route === '/doctor/dashboard' ? { exact: true } : { exact: false }"
                      class="group flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-1.5 xs:px-2 sm:px-3 py-2 xs:py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 min-h-[44px]"
                      [class.justify-center]="sidebarCollapsed()"
                      [title]="sidebarCollapsed() ? item.label : ''"
                      >
                      <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
                      </svg>
                      @if (!sidebarCollapsed()) {
                        <span class="truncate">{{ item.label }}</span>
                      }
                    </a>
                  }
                  <!-- Dropdown Type -->
                  @if (item.type === 'dropdown') {
                    <div class="">
                      <button
                        (click)="toggleMenuItem(item.id)"
                        class="group w-full flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-1.5 xs:px-2 sm:px-3 py-2 xs:py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 min-h-[44px]"
                        [class.justify-center]="sidebarCollapsed()"
                        [title]="sidebarCollapsed() ? item.label : ''"
                        [class.bg-primary-50]="isMenuItemActive(item)"
                        [class.text-primary-700]="isMenuItemActive(item)"
                        >
                        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
                        </svg>
                        @if (!sidebarCollapsed()) {
                          <span class="truncate">{{ item.label }}</span>
                        }
                        @if (!sidebarCollapsed()) {
                          <svg class="h-4 w-4 ml-auto transition-transform duration-200 flex-shrink-0"
                            [class.rotate-90]="isMenuItemExpanded(item.id)"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        }
                      </button>
                      @if (!sidebarCollapsed() && isMenuItemExpanded(item.id) && item.children) {
                        <div class="ml-4 xs:ml-5 sm:ml-6 mt-0.5 xs:mt-1 space-y-0.5 xs:space-y-1">
                          @for (child of item.children; track child) {
                            <a
                              [routerLink]="child.route!"
                              (click)="isMobile() && closeMobileMenu()"
                              routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                              class="group flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-1.5 xs:px-2 sm:px-3 py-2 xs:py-2 text-xs sm:text-sm rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors min-h-[40px]"
                              >
                              <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="child.icon"></path>
                              </svg>
                              <span class="truncate">{{ child.label }}</span>
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
                      <p class="text-xs text-on-surface-variant">No menu items</p>
                    }
                  </div>
                }
              </div>
            </div>
          </nav>
        </aside>
    
        <!-- Mobile Overlay -->
        @if (showMobileMenu()) {
          <div
            class="fixed inset-0 z-40 lg:hidden transition-opacity duration-300 bg-black bg-opacity-50 backdrop-blur-sm"
            (click)="closeMobileMenu()"
          ></div>
        }
    
        <!-- Main Content -->
        <main
          id="main-content"
          class="flex-1 overflow-y-auto focus:outline-none w-full"
          >
          <!-- Loading Indicator -->
          @if (isLoading()) {
            <div class="fixed top-14 xs:top-14 sm:top-16 left-0 right-0 z-50">
              <div class="h-1 bg-primary-200">
                <div class="h-1 bg-primary-600 animate-pulse"></div>
              </div>
            </div>
          }
    
          <!-- Page Content -->
          <div class="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    
      <!-- Footer -->
      <footer class="bg-surface border-t border-border flex-shrink-0">
        <div class="px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4">
          <div class="flex flex-col xs:flex-col sm:flex-row justify-between items-center gap-2 xs:gap-3 sm:gap-4">
            <div class="text-xs xs:text-xs sm:text-sm text-on-surface-variant text-center sm:text-left">
              <p>&copy; {{ currentYear }} MediPos. All rights reserved.</p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm text-on-surface-variant">
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
          class="fixed top-14 xs:top-14 sm:top-16 right-1 xs:right-2 sm:right-4 z-50 w-[calc(100vw-0.5rem)] xs:w-[calc(100vw-1rem)] sm:w-80 max-w-sm max-h-96 overflow-y-auto bg-surface border border-border rounded-lg shadow-strong"
          >
          <!-- Notifications content will be implemented -->
          <div class="p-2 xs:p-3 sm:p-4">
            <h3 class="text-sm xs:text-base sm:text-lg font-semibold text-on-surface mb-2 xs:mb-3 sm:mb-4">Notifications</h3>
            <div class="space-y-2">
              <div class="p-2 xs:p-2 sm:p-3 bg-surface-variant rounded-md">
                <p class="text-xs sm:text-sm font-medium text-on-surface">System notification</p>
                <p class="text-xs text-on-surface-variant mt-1">Doctor panel notifications</p>
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
export class DoctorLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private sessionTimeoutService = inject(SessionTimeoutService);
  confirmationDialog = inject(ConfirmationDialogService);
  private cdr = inject(ChangeDetectorRef);

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
  public companyName = signal('Doctor Panel');
  public unreadCount = signal(3);
  public currentUser = signal<any>(null);
  public currentYear = new Date().getFullYear();
  public expandedSettings = signal(false);
  public expandedMenuItems = signal<Set<string>>(new Set());
  public menuItems = signal<MenuItem[]>([]);
  public windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);
  private resizeListener?: () => void;
  private destroy$ = new Subject<void>();

  // Computed properties
  public isMobile = computed(() => this.windowWidth() < 1024);
  public isDark = computed(() => this.themeService.isDark());

  constructor() {
    // Get current user
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    // Handle window resize - update signal and manage mobile menu
    this.resizeListener = () => {
      this.windowWidth.set(window.innerWidth);
      if (window.innerWidth >= 1024) {
        this.showMobileMenu.set(false);
      }
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
    });
  }

  ngOnInit(): void {
    // Initialize window width
    this.windowWidth.set(typeof window !== 'undefined' ? window.innerWidth : 1024);

    this.loadMenuItems();

    // Auto-expand menu items if on their routes
    this.checkAndExpandMenuItems();

    // Listen for route changes to auto-expand menu items
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
        route: '/doctor/dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        type: 'link',
        order: 1
      },
      {
        id: 'drug-management',
        label: 'Drug Management',
        route: null,
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        type: 'dropdown',
        order: 2,
        children: [
          {
            id: 'drug-company',
            label: 'Company',
            route: '/doctor/drugs/company',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            type: 'link',
            order: 1
          },
          {
            id: 'drug-generic',
            label: 'Generic',
            route: '/doctor/drugs/generic',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            type: 'link',
            order: 2
          },
          {
            id: 'drug-strength',
            label: 'Drug Strength',
            route: '/doctor/drugs/strength',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            type: 'link',
            order: 3
          },
          {
            id: 'drug-type',
            label: 'Drug Type',
            route: '/doctor/drugs/type',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            type: 'link',
            order: 4
          },

          {
            id: 'drug-list',
            label: 'Drugs',
            route: '/doctor/drugs/list',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            type: 'link',
            order: 5
          }
        ]
      },
      {
        id: 'patients',
        label: 'Patients',
        route: '/doctor/patients',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        type: 'link',
        order: 3
      },
      {
        id: 'appointments',
        label: 'Appointment',
        route: '/doctor/appointments',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        type: 'link',
        order: 4
      },
      {
        id: 'templates',
        label: 'Template',
        route: null,
        icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
        type: 'dropdown',
        order: 5,
        children: [
          { id: 'tpl-treatment', label: 'Treatment', route: '/doctor/templates/treatment', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', type: 'link', order: 2 },
          { id: 'tpl-advice', label: 'Advice', route: '/doctor/templates/advice', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', type: 'link', order: 3 },
          { id: 'tpl-cc', label: 'C/C', route: '/doctor/templates/cc', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', type: 'link', order: 4 },
          { id: 'tpl-oe', label: 'O/E', route: '/doctor/templates/oe', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', type: 'link', order: 5 },
          { id: 'tpl-ix', label: 'I/X', route: '/doctor/templates/ix', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', type: 'link', order: 6 },
          { id: 'tpl-dx', label: 'D/X', route: '/doctor/templates/dx', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', type: 'link', order: 6.5 },
          { id: 'tpl-dose', label: 'Dose', route: '/doctor/templates/dose', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', type: 'link', order: 7 },
          { id: 'tpl-duration', label: 'Duration', route: '/doctor/templates/duration', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', type: 'link', order: 8 }
        ]
      },
      {
        id: 'prescriptions',
        label: 'Prescription',
        route: '/doctor/prescriptions',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        type: 'link',
        order: 6
      },
      {
        id: 'prescription-setup',
        label: 'Prescription Setup',
        route: null,
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        type: 'dropdown',
        order: 7,
        children: [
          { id: 'setup-header', label: 'Header', route: '/doctor/prescription-setup/header', icon: 'M5 15l7-7 7 7', type: 'link', order: 1 },
          { id: 'setup-body', label: 'Body', route: '/doctor/prescription-setup/body', icon: 'M4 6h16M4 12h16M4 18h16', type: 'link', order: 2 },
          { id: 'setup-footer', label: 'Footer', route: '/doctor/prescription-setup/footer', icon: 'M19 9l-7 7-7-7', type: 'link', order: 3 }
        ]
      },
      {
        id: 'settings',
        label: 'Account Settings',
        route: null,
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        type: 'dropdown',
        order: 8,
        children: [
          { id: 'set-profile', label: 'Doctor Profile', route: '/doctor/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', type: 'link', order: 1 },
        ]
      }
    ];
    this.menuItems.set(menu);
    this.isMenuLoading.set(false);
  }

  checkAndExpandMenuItems(): void {
    const currentUrl = this.router.url;
    const expanded = new Set(this.expandedMenuItems());

    this.menuItems().forEach((item: MenuItem) => {
      if (item.type === 'dropdown' && item.children) {
        // Check if any child route matches current URL
        const hasActiveChild = item.children.some((child: MenuItem) =>
          child.route && currentUrl.startsWith(child.route)
        );
        if (hasActiveChild) {
          expanded.add(item.id);
        }
      }
    });

    // Also update expandedSettings for backward compatibility
    if (currentUrl.startsWith('/doctor/settings')) {
      expanded.add('settings');
      this.expandedSettings.set(true);
    }

    // Set the expanded menu items after all checks
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

    // Update expandedSettings for backward compatibility
    if (itemId === 'settings') {
      this.expandedSettings.set(expanded.has(itemId));
    }
  }

  isMenuItemExpanded(itemId: string): boolean {
    return this.expandedMenuItems().has(itemId);
  }

  isMenuItemActive(item: MenuItem): boolean {
    if (item.type === 'dropdown' && item.children) {
      const currentUrl = this.router.url;
      return item.children.some((child: MenuItem) =>
        child.route && currentUrl.startsWith(child.route)
      );
    }
    return false;
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

  toggleSettings(): void {
    this.toggleMenuItem('settings');
  }

  isSettingsActive(): boolean {
    return this.router.url.startsWith('/doctor/settings');
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
    if (!user) return 'D';

    const firstName = user.userFName || '';
    const lastName = user.userLName || '';

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.userName) {
      return user.userName.charAt(0).toUpperCase();
    }

    return 'D';
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'Doctor';

    if (user.userFName && user.userLName) {
      return `${user.userFName} ${user.userLName}`;
    } else if (user.userFName) {
      return user.userFName;
    } else if (user.userName) {
      return user.userName;
    }

    return 'Doctor';
  }

  getUserRole(): string {
    return 'Doctor';
  }
}
