import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApprovalService } from '../../../core/services/approval.service';
import { CurrencyService, Currency } from '../../../core/services/currency.service';
import { BranchService } from '../../../core/services/branch.service';
import { UserDropdownMenuComponent } from '../user-dropdown-menu.component';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserDropdownMenuComponent],
  template: `
    <header class="bg-violet-800 border-b border-violet-700 sticky top-0 z-40 shadow-md">
      <div class="px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 xs:h-14 sm:h-16 gap-1 xs:gap-2 sm:gap-3">
          <!-- Left Section -->
          <div class="flex items-center gap-1 xs:gap-2 sm:gap-4 min-w-0">
            <!-- Mobile Menu Button -->
            <button
              type="button"
              (click)="toggleMobileMenu.emit(); $event.stopPropagation(); $event.preventDefault()"
              class="lg:hidden p-2 xs:p-2.5 rounded-md text-violet-200 hover:text-white hover:bg-violet-700 active:bg-violet-600 transition-colors flex-shrink-0 cursor-pointer min-h-10 min-w-10"
              >
              <svg class="h-5 xs:h-5 sm:h-6 w-5 xs:w-5 sm:w-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
    
            <!-- Desktop Sidebar Toggle Button -->
            <button
              type="button"
              (click)="toggleSidebar.emit()"
              class="hidden lg:block p-2 rounded-md text-violet-200 hover:text-white hover:bg-violet-700 transition-colors flex-shrink-0"
              [title]="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
    
            <!-- Logo -->
            <div class="flex items-center gap-1.5 xs:gap-2 sm:gap-3 min-w-0 cursor-pointer" (click)="navigateToHome()">
              <div class="w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="hidden xs:block min-w-0">
                <h1 class="text-sm xs:text-base sm:text-lg font-bold text-white truncate">MediPOS</h1>
                <p class="text-xs text-violet-200 truncate">{{ companyName() }}</p>
              </div>
            </div>
          </div>
    
          <!-- Center Section - Search -->
          <div class="flex-1 max-w-md mx-2 sm:mx-4 hidden lg:block">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search employees, requests, reports..."
                class="form-input pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-sm bg-white border-transparent text-gray-900 placeholder-gray-500 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20 rounded-lg shadow-sm"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
    
            <!-- Right Section -->
            <div class="flex items-center gap-0.5 xs:gap-1 sm:gap-2 flex-shrink-0">
              <!-- Mobile Search Button -->
              <button
                type="button"
                (click)="toggleMobileSearch.emit(); $event.stopPropagation()"
                class="lg:hidden p-1.5 xs:p-2 rounded-md text-violet-200 hover:text-white hover:bg-violet-700 transition-colors"
                >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
    
              <!-- Theme Toggle -->
              <button
                type="button"
                (click)="toggleTheme()"
                class="p-1.5 xs:p-2 rounded-md text-violet-200 hover:text-white hover:bg-violet-700 transition-colors"
                [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
                >
                @if (!themeService.isDark()) {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                }
                @if (themeService.isDark()) {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                }
              </button>
    
              <!-- User Menu -->
              <div class="relative user-dropdown-container">
                <button
                  (click)="toggleUserDropdown()"
                  class="flex items-center gap-1 xs:gap-1.5 sm:gap-2 p-1 xs:p-1.5 sm:p-2 rounded-md text-violet-100 hover:text-white hover:bg-violet-700 transition-colors"
                  >
                  <div class="w-7 h-7 xs:w-8 xs:h-8 sm:w-8 sm:h-8 bg-white text-violet-800 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-sm border border-violet-200">
                    {{ userInitials() }}
                  </div>
                  <div class="hidden sm:block text-left min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ getUserDisplayName() }}</p>
                    <p class="text-xs text-violet-200 truncate">{{ getDisplayText() }}</p>
                  </div>
                  <svg
                    class="h-4 w-4 transition-transform duration-200 hidden sm:block flex-shrink-0"
                    [class.rotate-180]="isUserDropdownOpen()"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
    
                <!-- User Dropdown Menu -->
                <app-user-dropdown-menu
                  [isOpen]="isUserDropdownOpen()"
                  [user]="currentUser()"
                  (menuItemClick)="onMenuItemClick()"
                  (logoutCompleted)="onLogoutCompleted($event)"
                ></app-user-dropdown-menu>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Mobile Search Bar -->
        @if (showMobileSearch) {
          <div class="lg:hidden px-2 xs:px-3 sm:px-4 pb-2 xs:pb-3 sm:pb-4 border-t border-border">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search..."
                class="form-input pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 w-full text-sm"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          }
        </header>
    `,
  styles: []
})
export class TopBarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  currencyService = inject(CurrencyService);
  private notificationService = inject(NotificationService);
  private approvalService = inject(ApprovalService);
  private branchService = inject(BranchService);
  router = inject(Router);

  @Input() showMobileSearch = false;
  @Input() companyName = signal('TechCorp Inc.');
  @Input() sidebarCollapsed = false;

  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() toggleMobileSearch = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() toggleUserMenu = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  public searchQuery = '';
  public currentUser = signal<any>(null);
  public unreadCount = signal(0);
  public inboxUnreadCount = signal(0);
  public isUserDropdownOpen = signal(false);
  public isCurrencyDropdownOpen = signal(false);
  public availableBranches = signal<any[]>([]);

  constructor() {
    // Initialize current user
    this.currentUser.set(this.authService.getCurrentUser());

    // Subscribe to user changes
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser.set(user);
    });

    // Load branches
    this.loadBranches();

    // Subscribe to notification count
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount.set(count);
    });

    // Subscribe to inbox unread count
    this.approvalService.unreadCountSubject.subscribe((count: number) => {
      this.inboxUnreadCount.set(count);
    });

    // Close currency dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-dropdown-container')) {
        this.isCurrencyDropdownOpen.set(false);
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }

  userInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';

    // For Admin users, show "A" instead of initials
    if (user.roles && user.roles.includes('Admin')) {
      return 'A';
    }

    // For System-Admin users, show "SA"
    if (user.roles && user.roles.includes('System-Admin')) {
      return 'SA';
    }

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

    // For Admin users, show "Admin" instead of full name
    if (user.roles && user.roles.includes('Admin')) {
      return 'Admin';
    }

    // For System-Admin users, show "System Administrator"
    if (user.roles && user.roles.includes('System-Admin')) {
      return 'System Administrator';
    }

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

    const role = user.roles[0] || 'Employee';

    // Show "Admin" for Admin role, "System Administrator" for System-Admin role
    if (role === 'Admin') {
      return 'Admin';
    } else if (role === 'System-Admin') {
      return 'System Administrator';
    }

    return role;
  }

  getDisplayText(): string {
    const user = this.currentUser();
    if (!user) return 'Employee';

    // For System-Admin, only show role, not branch
    if (user.roles && user.roles.includes('System-Admin')) {
      return this.getUserRole();
    }

    // For Admin users, always show "Admin" (not branch)
    if (user.roles && user.roles.includes('Admin')) {
      return 'Admin';
    }

    // For other users, show branch if available, otherwise show role
    const branch = this.getUserBranch();
    return branch || this.getUserRole();
  }

  getUserBranch(): string {
    const user = this.currentUser();
    if (!user || !user.branchId) return '';

    const branches = this.availableBranches();
    if (branches.length === 0) return '';

    // Try to find branch by ID (handle both string and number comparisons)
    const branch = branches.find(b =>
      b.id === user.branchId ||
      b.id === String(user.branchId) ||
      String(b.id) === String(user.branchId)
    );

    return branch ? branch.name : '';
  }

  loadBranches(): void {
    this.branchService.getActiveBranches().subscribe({
      next: (branches) => {
        const mappedBranches = branches.map(b => ({
          id: b.id,
          name: b.name,
          code: b.code,
          address: b.description
        }));
        this.availableBranches.set(mappedBranches);
      },
      error: (err) => {
        console.error('Failed to load branches', err);
        // Fallback to empty array on error
        this.availableBranches.set([]);
      }
    });
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.set(!this.isUserDropdownOpen());
  }

  onMenuItemClick(): void {
    // Handle menu item click if needed
    this.isUserDropdownOpen.set(false);
  }

  onLogoutCompleted(success: boolean): void {
    if (success) {
      // Logout was successful, user will be redirected by the logout service
      this.isUserDropdownOpen.set(false);
    }
  }

  toggleCurrencyDropdown(): void {
    this.isCurrencyDropdownOpen.set(!this.isCurrencyDropdownOpen());
  }

  selectCurrency(currency: Currency): void {
    this.currencyService.setCurrency(currency);
    this.isCurrencyDropdownOpen.set(false);
    // Optionally emit an event or notify other components
    this.notificationService.success('Currency Changed', `Currency changed to ${currency.name} (${currency.code})`);
  }

  navigateToHome(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    if (user.roles && user.roles.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else if (user.roles && user.roles.includes('System-Admin')) {
      this.router.navigate(['/system-admin']);
    } else {
      this.router.navigate(['/doctor/dashboard']);
    }
  }
}

