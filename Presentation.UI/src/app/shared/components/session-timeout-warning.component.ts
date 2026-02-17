import { Component, signal, computed, inject } from '@angular/core';

import { SessionTimeoutService } from '../../core/services/session-timeout.service';

@Component({
  selector: 'app-session-timeout-warning',
  standalone: true,
  imports: [],
  template: `
    @if (sessionTimeoutService.showWarning()) {
      <div
        class="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
        <div class="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg shadow-lg p-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-warning-800 dark:text-warning-200">
                Session Expiring Soon
              </h3>
              <p class="text-xs text-warning-700 dark:text-warning-300 mt-1">
                Your session will expire in {{ sessionTimeoutService.timeRemaining() }} minutes.
              </p>
              <div class="mt-3 flex gap-2">
                <button
                  (click)="extendSession()"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-warning-600 hover:bg-warning-700 rounded-md transition-colors"
                  >
                  Stay Logged In
                </button>
                <button
                  (click)="logoutNow()"
                  class="px-3 py-1.5 text-xs font-medium text-warning-700 dark:text-warning-300 hover:text-warning-800 dark:hover:text-warning-200 hover:bg-warning-100 dark:hover:bg-warning-800 rounded-md transition-colors"
                  >
                  Logout Now
                </button>
              </div>
            </div>
            <button
              (click)="dismissWarning()"
              class="w-6 h-6 text-warning-500 hover:text-warning-700 dark:hover:text-warning-300 transition-colors flex-shrink-0"
              >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <!-- Progress bar -->
          <div class="mt-3 w-full bg-warning-200 dark:bg-warning-700 rounded-full h-1">
            <div
              class="bg-warning-500 h-1 rounded-full transition-all duration-1000"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
        </div>
      </div>
    }
    `,
  styles: []
})
export class SessionTimeoutWarningComponent {
  sessionTimeoutService = inject(SessionTimeoutService);


  extendSession(): void {
    this.sessionTimeoutService.extendSession();
  }

  logoutNow(): void {
    this.sessionTimeoutService.logoutNow();
  }

  dismissWarning(): void {
    this.sessionTimeoutService.dismissWarning();
  }

  progressPercentage(): number {
    const timeRemaining = this.sessionTimeoutService.timeRemaining();
    const warningThreshold = 5; // 5 minutes warning
    return Math.max(0, (timeRemaining / warningThreshold) * 100);
  }
}
