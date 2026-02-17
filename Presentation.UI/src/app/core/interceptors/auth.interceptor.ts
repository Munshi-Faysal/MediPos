import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { TenantService } from '../services/tenant.service';
import { UserActivityService } from '../services/user-activity.service';

// Global state for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);

  // Skip token addition for auth endpoints (they use cookies)
  const isAuthEndpoint = req.url.includes('/Auth/login') || 
                         req.url.includes('/Auth/register') || 
                         req.url.includes('/Auth/refresh');

  // Build headers object for cloning
  const headers: Record<string, string> = {};
  
  // Add auth token to requests (if not using cookies)
  const token = authService.getToken();
  if (token && !isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add tenant header for multi-tenant support
  const tenantCode = tenantService.getStoredTenantCode();
  if (tenantCode) {
    headers['X-Tenant-Id'] = tenantCode;
  }

  // Clone request once with all headers and withCredentials
  req = req.clone({
    setHeaders: headers,
    withCredentials: true // Always send cookies
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(request: any, token: string): any {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(request: any, next: any, authService: AuthService): Observable<any> {
  const userActivityService = inject(UserActivityService);
  const token = authService.getToken();
  
  // Skip token refresh for mock tokens (no real login logic)
  if (token && token.startsWith('mock-')) {
    // For mock tokens, just retry the request without refreshing
    return next(request);
  }

  // Check if user is active before attempting refresh
  if (!userActivityService.isUserActive()) {
    // User inactive, logout immediately
    authService.forceLogout();
    return throwError(() => new Error('User inactive, session expired'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.token);
        // Update user activity after successful refresh
        userActivityService.reset();
        // Retry request with new token (cookies are automatically sent)
        const newRequest = addTokenToRequest(request, tokens.token);
        return next(newRequest);
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        // Refresh failed, logout
        authService.forceLogout();
        return throwError(() => error);
      })
    );
  } else {
    // Wait for ongoing refresh to complete
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        const newRequest = addTokenToRequest(request, token);
        return next(newRequest);
      })
    );
  }
}
