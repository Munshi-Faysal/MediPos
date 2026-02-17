import { Component, signal, computed, inject } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirmation-dialog',
  standalone: true,
  imports: [],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-surface border border-border rounded-lg shadow-strong max-w-md w-full mx-4">
        <!-- Header -->
        <div class="p-6 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-on-surface">Confirm Logout</h3>
              <p class="text-sm text-on-surface-variant">Are you sure you want to logout?</p>
            </div>
          </div>
        </div>
    
        <!-- Content -->
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-start gap-3 p-3 bg-surface-variant rounded-md">
              <svg class="w-5 h-5 text-on-surface-variant mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-on-surface">Session Information</p>
                <p class="text-xs text-on-surface-variant mt-1">
                  Your current session will be terminated and you'll need to login again to access the system.
                </p>
              </div>
            </div>
    
            @if (tokenExpirationTime() > 0) {
              <div class="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900 rounded-md">
                <svg class="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-primary-700 dark:text-primary-300">Session Expires In</p>
                  <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    {{ tokenExpirationTime() }} minutes
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
    
        <!-- Actions -->
        <div class="p-6 border-t border-border flex justify-end gap-3">
          <button
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-md transition-colors"
            >
            Cancel
          </button>
          <button
            (click)="onConfirm()"
            [disabled]="isLoggingOut()"
            class="px-4 py-2 text-sm font-medium text-white bg-error-600 hover:bg-error-700 disabled:bg-error-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
            >
            @if (isLoggingOut()) {
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            }
            {{ isLoggingOut() ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class LogoutConfirmationDialogComponent {
  private dialogRef = inject<MatDialogRef<LogoutConfirmationDialogComponent>>(MatDialogRef);

  public isLoggingOut = signal(false);
  public tokenExpirationTime = signal(0);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.isLoggingOut.set(true);
    // Simulate logout process
    setTimeout(() => {
      this.dialogRef.close(true);
    }, 1000);
  }

  setTokenExpirationTime(minutes: number): void {
    this.tokenExpirationTime.set(minutes);
  }
}
