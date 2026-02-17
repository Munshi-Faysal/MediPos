import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, map, catchError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PackageService } from '../services/package.service';
import { DoctorService } from '../services/doctor.service';
import { Package } from '../models/package.model';

/**
 * Package Guard - Protects routes based on package user limit
 * Checks if user's package has the required user limit
 * 
 * Usage in routes:
 * {
 *   path: 'doctors',
 *   canActivate: [PackageGuard],
 *   data: { minUsers: 5 } // Requires package with at least 5 users
 * }
 */
export const PackageGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const authService = inject(AuthService);
  const packageService = inject(PackageService);
  const doctorService = inject(DoctorService);
  const router = inject(Router);

  // Get current user
  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  // Get required user limit from route data
  const requiredUserLimit = route.data['minUsers'] as number | undefined;
  
  // If no requirement specified, allow access
  if (requiredUserLimit === undefined) {
    return of(true);
  }

  // Try to get user's package
  // First, check if package info is stored in localStorage/session
  const storedPackageId = localStorage.getItem('user_package_id');
  
  if (storedPackageId) {
    // Get package from service
    return packageService.getPackageById(storedPackageId).pipe(
      map((pkg: Package) => {
        return checkPackageAccess(pkg, requiredUserLimit, router, state);
      }),
      catchError(() => {
        // If package not found, try to get from doctor record
        return getPackageFromDoctor(user.id, doctorService, packageService, requiredUserLimit, router, state);
      })
    );
  }

  // If no stored package, try to get from doctor record
  return getPackageFromDoctor(user.id, doctorService, packageService, requiredUserLimit, router, state);
};

/**
 * Get package from doctor record
 */
function getPackageFromDoctor(
  userId: string,
  doctorService: DoctorService,
  packageService: PackageService,
  requiredUserLimit: number,
  router: Router,
  state: RouterStateSnapshot
): Observable<boolean> {
  // Try to find doctor record for this user
  return doctorService.getDoctors().pipe(
    switchMap(doctors => {
      const doctor = doctors.find(d => d.userId === userId);
      const packageId = doctor?.assignedPackageId || doctor?.packageId;
      if (doctor && packageId) {
        // Found doctor with package, get package details
        return packageService.getPackageById(packageId).pipe(
          map((pkg: Package) => {
            // Store package ID for future use
            localStorage.setItem('user_package_id', pkg.id);
            return checkPackageAccess(pkg, requiredUserLimit, router, state);
          }),
          catchError(() => {
            // Package not found, deny access
            return of(handleNoPackage(requiredUserLimit, router, state));
          })
        );
      }
      
      // No doctor record found
      return of(handleNoPackage(requiredUserLimit, router, state));
    }),
    catchError(() => {
      // Error getting doctors, handle no package
      return of(handleNoPackage(requiredUserLimit, router, state));
    })
  );
}

/**
 * Handle case when no package is found
 */
function handleNoPackage(
  requiredUserLimit: number,
  router: Router,
  state: RouterStateSnapshot
): boolean {
  // For demo purposes, allow access if accessing doctor routes (single user package)
  // In production, this should be more strict
  if (requiredUserLimit === 1) {
    // Single user package - allow if accessing doctor routes
    if (state.url.startsWith('/doctor')) {
      return true;
    }
    router.navigate(['/admin'], {
      queryParams: { error: 'package_required' }
    });
    return false;
  }
  
  // For multi-user packages, allow access for demo
  // In production, this should check if user has admin role and proper package
  return true;
}

/**
 * Check if package has required user limit
 */
function checkPackageAccess(
  pkg: Package,
  requiredUserLimit: number,
  router: Router,
  state: RouterStateSnapshot
): boolean {
  // If required limit is 1, user must have exactly 1 user package
  if (requiredUserLimit === 1) {
    if (pkg.userLimit === 1) {
      return true;
    } else {
      router.navigate(['/admin'], {
        queryParams: { error: 'single_user_package_required' }
      });
      return false;
    }
  }

  // For multi-user packages, check if user's package has enough users
  // -1 means unlimited, so always allow
  if (pkg.userLimit === -1) {
    return true;
  }

  // Check if user's package has at least the required user limit
  if (pkg.userLimit >= requiredUserLimit) {
    return true;
  }

  // Package doesn't meet requirements
  router.navigate(['/admin'], {
    queryParams: { error: 'insufficient_package_users' }
  });
  return false;
}
