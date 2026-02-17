import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LogoutService } from './logout.service';

export interface LogoutEvent {
  type: 'logout-initiated' | 'logout-completed' | 'logout-cancelled';
  reason?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LogoutUtilityService {
  private logoutService = inject(LogoutService);

  private logoutEventsSubject = new BehaviorSubject<LogoutEvent | null>(null);
  public logoutEvents$ = this.logoutEventsSubject.asObservable();

  /**
   * Emit logout event
   */
  private emitLogoutEvent(type: LogoutEvent['type'], reason?: string): void {
    this.logoutEventsSubject.next({
      type,
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Logout with user confirmation and event tracking
   */
  logoutWithConfirmation(reason?: string): Observable<boolean> {
    this.emitLogoutEvent('logout-initiated', reason);
    
    return this.logoutService.logout({
      showConfirmation: true,
      reason: 'user-initiated'
    });
  }

  /**
   * Quick logout without confirmation
   */
  quickLogout(reason?: string): Observable<boolean> {
    this.emitLogoutEvent('logout-initiated', reason);
    
    return this.logoutService.logout({
      showConfirmation: false,
      reason: 'user-initiated'
    });
  }

  /**
   * Emergency logout (for security issues)
   */
  emergencyLogout(reason = 'security'): void {
    this.emitLogoutEvent('logout-initiated', reason);
    this.logoutService.logoutDueToSecurity();
  }

  /**
   * Session timeout logout
   */
  sessionTimeoutLogout(): void {
    this.emitLogoutEvent('logout-initiated', 'session-expired');
    this.logoutService.logoutDueToSessionExpiry();
  }

  /**
   * Maintenance logout
   */
  maintenanceLogout(): void {
    this.emitLogoutEvent('logout-initiated', 'maintenance');
    this.logoutService.logoutDueToMaintenance();
  }

  /**
   * Get logout history (for debugging/analytics)
   */
  getLogoutHistory(): LogoutEvent[] {
    // This would typically come from a service that stores logout events
    // For now, we'll return the current event
    const currentEvent = this.logoutEventsSubject.value;
    return currentEvent ? [currentEvent] : [];
  }

  /**
   * Clear logout events (useful for testing)
   */
  clearLogoutEvents(): void {
    this.logoutEventsSubject.next(null);
  }
}
