import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard - Protects routes based on user role
 * Checks if user has the required role
 * 
 * Usage in routes:
 * {
 *   path: 'admin',
 *   canActivate: [RoleGuard],
 *   data: { role: 'Admin' } // Requires Admin role
 * }
 * 
 * Or for multiple roles:
 * {
 *   path: 'admin',
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Admin', 'SuperAdmin'] } // Requires one of these roles
 * }
 */
export const RoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get current user
  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  // Get required role(s) from route data
  const requiredRole = route.data['role'] as string | undefined;
  const requiredRoles = route.data['roles'] as string[] | undefined;

  // If no role requirement specified, allow access
  if (!requiredRole && !requiredRoles) {
    return of(true);
  }

  // Get user's roles
  const userRoles = user.roles || [];

  // Check single role
  if (requiredRole) {
    const hasRole = userRoles.some(role => 
      role.toLowerCase() === requiredRole.toLowerCase()
    );
    
    if (!hasRole) {
      router.navigate(['/admin'], {
        queryParams: { error: 'insufficient_permissions', requiredRole }
      });
      return of(false);
    }
    
    return of(true);
  }

  // Check multiple roles (user needs at least one)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(requiredRole =>
      userRoles.some(userRole => 
        userRole.toLowerCase() === requiredRole.toLowerCase()
      )
    );

    if (!hasAnyRole) {
      router.navigate(['/admin'], {
        queryParams: { error: 'insufficient_permissions', requiredRoles: requiredRoles.join(',') }
      });
      return of(false);
    }

    return of(true);
  }

  // Default: allow access
  return of(true);
};
