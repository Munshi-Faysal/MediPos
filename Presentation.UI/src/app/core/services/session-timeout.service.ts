import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  private sessionCheckInterval?: Subscription;
  private warningThreshold = 5; // Show warning 5 minutes before expiry
  private checkInterval = 60000; // Check every minute

  public showWarning = signal(false);
  public timeRemaining = signal(0);

  constructor() {
    this.startSessionMonitoring();
  }

  private startSessionMonitoring(): void {
    // Check session status every minute
    // this.sessionCheckInterval = interval(this.checkInterval).subscribe(() => {
    //   this.checkSessionStatus();
    // });

    // Initial check
    this.checkSessionStatus();
  }

  private checkSessionStatus(): void {
    if (!this.authService.isAuthenticated()) {
      this.stopSessionMonitoring();
      return;
    }

    // Skip session timeout check for mock tokens (no real login logic)
    const token = this.authService.getToken();
    if (token && token.startsWith('mock-')) {
      // Mock token - don't check expiration, always return valid time
      this.timeRemaining.set(999); // Set a high value so it never expires
      this.showWarning.set(false);
      return;
    }

    const timeRemaining = this.authService.getTokenExpirationTime();
    this.timeRemaining.set(timeRemaining);

    if (timeRemaining <= 0) {
      // Token expired, force logout
      this.handleSessionExpired();
    } else {
      // Hide warning if time increased (token refreshed)
      this.showWarning.set(false);
    }
  }

  private handleSessionExpired(): void {
    this.authService.forceLogout();
    this.router.navigate(['/auth/login'], {
      queryParams: { reason: 'session-expired' }
    });
  }

  public extendSession(): void {
    // This would typically trigger a token refresh
    this.authService.refreshToken().subscribe({
      next: () => {
        this.showWarning.set(false);
        this.checkSessionStatus();
      },
      error: () => {
        this.handleSessionExpired();
      }
    });
  }

  public logoutNow(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  public dismissWarning(): void {
    this.showWarning.set(false);
  }

  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      this.sessionCheckInterval.unsubscribe();
      this.sessionCheckInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopSessionMonitoring();
  }
}
