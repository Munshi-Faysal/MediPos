import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';

import { LogoutUtilityService } from '../../core/services/logout-utility.service';

export type LogoutButtonType = 'primary' | 'secondary' | 'danger' | 'ghost';
export type LogoutButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [],
  template: `
    <button
      (click)="handleLogout()"
      [disabled]="isLoggingOut()"
      [class]="getButtonClasses()"
      [title]="tooltip"
      >
      @if (isLoggingOut()) {
        <svg
          class="animate-spin"
          [class]="getIconClasses()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      }
      @if (!isLoggingOut()) {
        <svg
          [class]="getIconClasses()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
      }
      @if (showText) {
        <span>{{ isLoggingOut() ? 'Logging out...' : text }}</span>
      }
    </button>
    `,
  styles: []
})
export class LogoutButtonComponent {
  private logoutUtilityService = inject(LogoutUtilityService);

  @Input() type: LogoutButtonType = 'secondary';
  @Input() size: LogoutButtonSize = 'md';
  @Input() showText = true;
  @Input() text = 'Logout';
  @Input() tooltip = 'Logout from the system';
  @Input() requireConfirmation = true;
  @Input() reason = 'user-initiated';

  @Output() logoutStarted = new EventEmitter<void>();
  @Output() logoutCompleted = new EventEmitter<boolean>();
  @Output() logoutCancelled = new EventEmitter<void>();

  public isLoggingOut = signal(false);

  handleLogout(): void {
    this.logoutStarted.emit();
    this.isLoggingOut.set(true);

    const logoutObservable = this.requireConfirmation 
      ? this.logoutUtilityService.logoutWithConfirmation(this.reason)
      : this.logoutUtilityService.quickLogout(this.reason);

    logoutObservable.subscribe({
      next: (success) => {
        this.isLoggingOut.set(false);
        if (success) {
          this.logoutCompleted.emit(true);
        } else {
          this.logoutCancelled.emit();
        }
      },
      error: () => {
        this.isLoggingOut.set(false);
        this.logoutCompleted.emit(false);
      }
    });
  }

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const typeClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 focus:ring-primary-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
      ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant focus:ring-primary-500'
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${typeClasses[this.type]}`;
  }

  getIconClasses(): string {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return sizeClasses[this.size];
  }
}
