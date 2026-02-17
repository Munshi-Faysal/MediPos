import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LogoutService } from '../services/logout.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {
  private authService = inject(AuthService);
  private logoutService = inject(LogoutService);
  private router = inject(Router);


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      this.logoutService.logoutDueToSessionExpiry();
      return of(false);
    }

    return of(true);
  }
}
