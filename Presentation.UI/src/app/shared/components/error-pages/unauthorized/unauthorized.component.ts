import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center">
        <div class="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-12 w-12 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h1 class="text-6xl font-bold text-error-600 mb-4">401</h1>
        <h2 class="text-2xl font-semibold text-on-surface mb-4">Unauthorized</h2>
        <p class="text-on-surface-variant mb-8 max-w-md mx-auto">
          You need to be logged in to access this page. Please sign in to continue.
        </p>
        <div class="space-x-4">
          <button (click)="goToLogin()" class="btn-primary">
            Sign In
          </button>
          <button (click)="goHome()" class="btn-outline">
            Go Home
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {
  private router = inject(Router);


  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/app/dashboard']);
  }
}


