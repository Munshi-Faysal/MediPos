import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

export interface LogoutOptions {
  showConfirmation?: boolean;
  redirectTo?: string;
  reason?: 'user-initiated' | 'session-expired' | 'security' | 'maintenance';
}

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private authService = inject(AuthService);
  private router = inject(Router);


  /**
   * Perform logout with various options
   */
  logout(options: LogoutOptions = {}): Observable<boolean> {
    const {
      showConfirmation = false,
      redirectTo = '/auth/login',
      reason = 'user-initiated'
    } = options;

    if (showConfirmation) {
      return this.logoutWithConfirmation(redirectTo, reason);
    } else {
      return this.logoutDirect(redirectTo, reason);
    }
  }

  /**
   * Logout with confirmation dialog
   */
  private logoutWithConfirmation(redirectTo: string, reason: string): Observable<boolean> {
    return this.authService.logoutWithConfirmation();
  }

  /**
   * Direct logout without confirmation
   */
  private logoutDirect(redirectTo: string, reason: string): Observable<boolean> {
    return new Observable(observer => {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate([redirectTo], { 
            queryParams: { reason } 
          });
          observer.next(true);
          observer.complete();
        },
        error: () => {
          // Even if logout fails, redirect user
          this.router.navigate([redirectTo], { 
            queryParams: { reason } 
          });
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Force logout (for security reasons, session expiry, etc.)
   */
  forceLogout(reason = 'security'): void {
    this.authService.forceLogout();
    this.router.navigate(['/auth/login'], { 
      queryParams: { reason } 
    });
  }

  /**
   * Logout due to session expiry
   */
  logoutDueToSessionExpiry(): void {
    this.forceLogout('session-expired');
  }

  /**
   * Logout due to security reasons
   */
  logoutDueToSecurity(): void {
    this.forceLogout('security');
  }

  /**
   * Logout due to maintenance
   */
  logoutDueToMaintenance(): void {
    this.forceLogout('maintenance');
  }
}
