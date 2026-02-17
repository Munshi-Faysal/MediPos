import { Component, Input, Output, EventEmitter, signal, HostListener, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LogoutService } from '../../core/services/logout.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Component({
  selector: 'app-user-dropdown-menu',
  standalone: true,
  imports: [RouterModule, ConfirmationDialogComponent],
  template: `
    @if (isOpen) {
      <div
        class="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50"
        >
        <!-- User Info Header -->
        <div class="px-4 py-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-on-surface truncate">{{ getUserDisplayName() }}</p>
              <p class="text-xs text-on-surface-variant truncate">{{ getUserEmail() }}</p>
              <p class="text-xs text-primary-600 dark:text-primary-400">{{ getUserRole() }}</p>
            </div>
          </div>
        </div>
        <!-- Menu Items -->
        <div class="py-2">
          <!-- Profile -->
          <a
            [routerLink]="getProfileRoute()"
            (click)="onMenuItemClick()"
            class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
            >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Profile
          </a>
          <!-- Settings -->
          <a
            routerLink="/app/settings"
            (click)="onMenuItemClick()"
            class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
            >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </a>
          <!-- Help & Support -->
          <a
            href="/app/help"
            (click)="onMenuItemClick()"
            class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
            >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Help & Support
          </a>
          <!-- Divider -->
          <div class="border-t border-border my-2"></div>
          <!-- Logout -->
          <button
            (click)="onLogoutClick()"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 rounded-md transition-colors"
            >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    }
    
    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      [isVisible]="showLogoutDialog"
      title="Confirm Logout"
      message="Are you sure you want to logout?"
      details="You will need to login again to access the system."
      confirmText="Logout"
      cancelText="Cancel"
      (confirmed)="onLogoutConfirmed($event)"
    ></app-confirmation-dialog>
    `,
  styles: []
})
export class UserDropdownMenuComponent {
  private logoutService = inject(LogoutService);
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() user: any = null;

  @Output() menuItemClick = new EventEmitter<void>();
  @Output() logoutCompleted = new EventEmitter<boolean>();

  public showLogoutDialog = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.menuItemClick.emit(); // Emit to parent to close dropdown
    }
  }

  getUserInitials(): string {
    if (!this.user) return 'U';
    
    // For Admin users, show "A" instead of initials
    if (this.user.roles && this.user.roles.includes('Admin')) {
      return 'A';
    }
    
    // For System-Admin users, show "SA"
    if (this.user.roles && this.user.roles.includes('System-Admin')) {
      return 'SA';
    }
    
    const firstName = this.user.userFName || '';
    const lastName = this.user.userLName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (this.user.userName) {
      return this.user.userName.charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  getUserDisplayName(): string {
    if (!this.user) return 'User';
    
    // For Admin users, show "Admin" instead of full name
    if (this.user.roles && this.user.roles.includes('Admin')) {
      return 'Admin';
    }
    
    // For System-Admin users, show "System Administrator"
    if (this.user.roles && this.user.roles.includes('System-Admin')) {
      return 'System Administrator';
    }
    
    if (this.user.userFName && this.user.userLName) {
      return `${this.user.userFName} ${this.user.userLName}`;
    } else if (this.user.userFName) {
      return this.user.userFName;
    } else if (this.user.userName) {
      return this.user.userName;
    }
    
    return 'User';
  }

  getUserEmail(): string {
    return this.user?.email || 'user@example.com';
  }

  getUserRole(): string {
    if (!this.user || !this.user.roles || this.user.roles.length === 0) {
      return 'Employee';
    }
    
    const role = this.user.roles[0] || 'Employee';
    
    // Show "Admin" for Admin role, "System Administrator" for System-Admin role
    if (role === 'Admin') {
      return 'Admin';
    } else if (role === 'System-Admin') {
      return 'System Administrator';
    }
    
    return role;
  }

  onMenuItemClick(): void {
    this.menuItemClick.emit();
  }

  onLogoutClick(): void {
    this.showLogoutDialog = true;
  }

  onLogoutConfirmed(confirmed: boolean): void {
    this.showLogoutDialog = false;
    
    if (confirmed) {
      this.logoutService.logout({
        showConfirmation: false,
        reason: 'user-initiated'
      }).subscribe(success => {
        this.logoutCompleted.emit(success);
      });
    }
  }

  onLogoutCompleted(success: boolean): void {
    this.logoutCompleted.emit(success);
  }

  getProfileRoute(): string {
    if (!this.user || !this.user.roles) return '/app/profile';
    
    // Route Admin users to /admin/profile
    if (this.user.roles.includes('Admin')) {
      return '/admin/profile';
    }
    
    // Route System-Admin users to /system-admin/profile
    if (this.user.roles.includes('System-Admin')) {
      return '/system-admin/profile';
    }
    
    // Default to /app/profile for other users
    return '/app/profile';
  }
}
