import { Component, ErrorHandler, Injectable, signal } from '@angular/core';


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error:', error);
    
    // You can add error reporting service here
    // this.errorReportingService.reportError(error);
  }
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="max-w-md w-full text-center">
        <!-- Error Icon -->
        <div class="w-16 h-16 mx-auto mb-6 bg-error-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
    
        <!-- Error Message -->
        <h1 class="text-2xl font-bold text-on-surface mb-4">
          {{ errorTitle() }}
        </h1>
    
        <p class="text-on-surface-variant mb-6">
          {{ errorMessage() }}
        </p>
    
        <!-- Error Details (Development Only) -->
        @if (showDetails()) {
          <details class="mb-6 text-left">
            <summary class="cursor-pointer text-sm text-on-surface-variant hover:text-on-surface">
              Technical Details
            </summary>
            <pre class="mt-2 p-4 bg-surface-variant rounded text-xs text-on-surface-variant overflow-auto">{{ errorDetails() }}</pre>
          </details>
        }
    
        <!-- Actions -->
        <div class="space-y-3">
          <button
            (click)="retry()"
            class="btn-primary w-full"
            >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Try Again
          </button>
    
          <button
            (click)="goHome()"
            class="btn-outline w-full"
            >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Go Home
          </button>
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class ErrorBoundaryComponent {
  public errorTitle = signal('Something went wrong');
  public errorMessage = signal('An unexpected error occurred. Please try again.');
  public errorDetails = signal('');
  public showDetails = signal(false);

  constructor() {
    // Check if we're in development mode
    this.showDetails.set(!environment.production);
  }

  retry(): void {
    window.location.reload();
  }

  goHome(): void {
    window.location.href = '/app/dashboard';
  }
}

// Environment check (you'll need to import environment)
const environment = { production: false };
