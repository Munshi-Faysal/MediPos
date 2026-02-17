import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center">
        <div class="w-24 h-24 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-12 w-12 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
          </svg>
        </div>
        <h1 class="text-6xl font-bold text-warning-600 mb-4">403</h1>
        <h2 class="text-2xl font-semibold text-on-surface mb-4">Forbidden</h2>
        <p class="text-on-surface-variant mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <div class="space-x-4">
          <button (click)="goBack()" class="btn-primary">
            Go Back
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
export class ForbiddenComponent {
  private router = inject(Router);


  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/app/dashboard']);
  }
}


