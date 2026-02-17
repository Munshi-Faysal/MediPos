import { Injectable, inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { UserActivityService } from '../services/user-activity.service';

/**
 * Auth Guard - Protects routes requiring authentication
 * Checks if user is authenticated and token is valid
 * Automatically refreshes token if expired and user is active
 */
export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const userActivityService = inject(UserActivityService);
  const router = inject(Router);

  // Check if user is authenticated
  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  // Check if token exists
  const token = authService.getToken();
  if (!token) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  // Check if token is expired
  if (authService.isTokenExpired()) {
    // If user is active, try to refresh token
    if (userActivityService.isUserActive()) {
      return authService.refreshToken().pipe(
        map(() => {
          // Token refreshed successfully
          return true;
        }),
        catchError(() => {
          // Refresh failed, logout and redirect
          authService.forceLogout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        })
      );
    } else {
      // User inactive and token expired, logout
      authService.forceLogout();
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }
  }

  // Token is valid, allow access
  return of(true);
};

/**
 * Auth Guard for child routes
 */
export const authGuardChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return AuthGuard(route, state);
};

