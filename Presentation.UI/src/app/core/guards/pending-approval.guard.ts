import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';

import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PendingApprovalGuard implements CanActivate {
  private tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private router = inject(Router);


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const tenantCode = this.tenantService.getStoredTenantCode();
    
    if (!tenantCode) {
      // No tenant code, redirect to registration
      this.router.navigate(['/register']);
      return of(false);
    }

    return this.tenantService.getRegistrationStatus(tenantCode).pipe(
      take(1),
      map(tenant => {
        if (tenant.status === 'pending') {
          // Still pending approval, redirect to status page
          this.router.navigate(['/register/status', tenantCode]);
          return false;
        } else if (tenant.status === 'rejected') {
          // Rejected, redirect to status page
          this.router.navigate(['/register/status', tenantCode]);
          return false;
        } else if (tenant.status === 'approved') {
          // Approved, allow access
          this.tenantService.setCurrentTenant(tenant);
          return true;
        }
        
        // Default case, redirect to registration
        this.router.navigate(['/register']);
        return false;
      }),
      catchError(error => {
        // On error, redirect to registration
        this.router.navigate(['/register']);
        return of(false);
      })
    );
  }
}
