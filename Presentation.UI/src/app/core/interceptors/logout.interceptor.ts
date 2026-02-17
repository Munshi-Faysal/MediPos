import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LogoutService } from '../services/logout.service';

@Injectable()
export class LogoutInterceptor implements HttpInterceptor {
  private logoutService = inject(LogoutService);


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different logout scenarios
        if (error.status === 401) {
          // Unauthorized - token expired or invalid
          this.logoutService.logoutDueToSessionExpiry();
        } else if (error.status === 403) {
          // Forbidden - security issue
          this.logoutService.logoutDueToSecurity();
        } else if (error.status === 503) {
          // Service unavailable - maintenance
          this.logoutService.logoutDueToMaintenance();
        }

        return throwError(() => error);
      })
    );
  }
}
