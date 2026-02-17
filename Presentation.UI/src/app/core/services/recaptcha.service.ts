import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecaptchaResponse {
  success: boolean;
  token?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private readonly SITE_KEY = environment.recaptcha.siteKey;
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isVerifiedSubject = new BehaviorSubject<boolean>(false);
  
  public token$ = this.tokenSubject.asObservable();
  public isVerified$ = this.isVerifiedSubject.asObservable();
  
  public currentToken = signal<string | null>(null);
  public isVerified = signal<boolean>(false);

  constructor() {}

  /**
   * Get the reCAPTCHA site key
   */
  getSiteKey(): string {
    return this.SITE_KEY;
  }

  /**
   * Set the reCAPTCHA token when user completes the challenge
   */
  setToken(token: string): void {
    this.currentToken.set(token);
    this.tokenSubject.next(token);
    this.isVerified.set(true);
    this.isVerifiedSubject.next(true);
  }

  /**
   * Clear the reCAPTCHA token
   */
  clearToken(): void {
    this.currentToken.set(null);
    this.tokenSubject.next(null);
    this.isVerified.set(false);
    this.isVerifiedSubject.next(false);
  }

  /**
   * Get the current token
   */
  getToken(): string | null {
    return this.currentToken();
  }

  /**
   * Check if reCAPTCHA is verified
   */
  getIsVerified(): boolean {
    return this.isVerified();
  }

  /**
   * Verify the token with the backend
   * This would typically make an API call to your backend
   */
  verifyToken(token: string): Observable<RecaptchaResponse> {
    // In a real implementation, you would make an HTTP request to your backend
    // to verify the token with Google's reCAPTCHA API
    
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // For demo purposes, we'll always return success
        // In production, you would verify with Google's API
        observer.next({
          success: true,
          token: token
        });
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Reset reCAPTCHA (useful for form resets)
   */
  reset(): void {
    this.clearToken();
    // In a real implementation, you might also reset the reCAPTCHA widget
  }

  /**
   * Handle reCAPTCHA error
   */
  handleError(error: string): void {
    this.clearToken();
    console.error('reCAPTCHA Error:', error);
  }

  /**
   * Handle reCAPTCHA expiration
   */
  handleExpired(): void {
    this.clearToken();
    console.warn('reCAPTCHA token expired');
  }
}
