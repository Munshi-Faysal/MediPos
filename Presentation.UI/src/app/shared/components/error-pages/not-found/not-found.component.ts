import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center">
        <div class="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h1 class="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-on-surface mb-4">Page Not Found</h2>
        <p class="text-on-surface-variant mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div class="space-x-4">
          <button (click)="goHome()" class="btn-primary">
            Go Home
          </button>
          <button (click)="goBack()" class="btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {
  private router = inject(Router);


  goHome(): void {
    this.router.navigate(['/app/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}


