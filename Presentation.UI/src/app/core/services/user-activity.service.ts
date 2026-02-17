import { Injectable, signal } from '@angular/core';
import { fromEvent, Subscription, debounceTime } from 'rxjs';

/**
 * Service to track user activity for token refresh
 * Monitors user interactions to determine if user is active
 */
@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private activitySubscriptions: Subscription[] = [];
  private lastActivityTime = signal<number>(Date.now());
  private readonly INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute in milliseconds (for testing)

  constructor() {
    this.startTracking();
  }

  /**
   * Start tracking user activity
   */
  startTracking(): void {
    // Track mouse movements
    const mouseMove$ = fromEvent(document, 'mousemove').pipe(debounceTime(1000));
    this.activitySubscriptions.push(
      mouseMove$.subscribe(() => this.updateActivity())
    );

    // Track keyboard events
    const keyDown$ = fromEvent(document, 'keydown').pipe(debounceTime(1000));
    this.activitySubscriptions.push(
      keyDown$.subscribe(() => this.updateActivity())
    );

    // Track clicks
    const click$ = fromEvent(document, 'click').pipe(debounceTime(1000));
    this.activitySubscriptions.push(
      click$.subscribe(() => this.updateActivity())
    );

    // Track scroll events
    const scroll$ = fromEvent(window, 'scroll').pipe(debounceTime(1000));
    this.activitySubscriptions.push(
      scroll$.subscribe(() => this.updateActivity())
    );

    // Track touch events (for mobile)
    const touchStart$ = fromEvent(document, 'touchstart').pipe(debounceTime(1000));
    this.activitySubscriptions.push(
      touchStart$.subscribe(() => this.updateActivity())
    );
  }

  /**
   * Stop tracking user activity
   */
  stopTracking(): void {
    this.activitySubscriptions.forEach(sub => sub.unsubscribe());
    this.activitySubscriptions = [];
  }

  /**
   * Update last activity time
   */
  private updateActivity(): void {
    this.lastActivityTime.set(Date.now());
  }

  /**
   * Check if user is currently active
   */
  isUserActive(): boolean {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime();
    return timeSinceLastActivity < this.INACTIVITY_TIMEOUT;
  }

  /**
   * Get time since last activity in milliseconds
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime();
  }

  /**
   * Get last activity time
   */
  getLastActivityTime(): number {
    return this.lastActivityTime();
  }

  /**
   * Reset activity tracking
   */
  reset(): void {
    this.updateActivity();
  }
}

