import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { TenantService } from '../services/tenant.service';

// Global state for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);

  const isAuthEndpoint = req.url.includes('/Account/Login') ||
                         req.url.includes('/Account/RefreshToken') ||
                         req.url.includes('/Auth/login') ||
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
      if (error.status === 401 && token && !isAuthEndpoint) {
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
  const token = authService.getToken();
  
  // Skip token refresh for mock tokens (no real login logic)
  if (token && token.startsWith('mock-')) {
    // For mock tokens, just retry the request without refreshing
    return next(request);
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.token);
        const newRequest = addTokenToRequest(request, tokens.token);
        return next(newRequest);
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
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
