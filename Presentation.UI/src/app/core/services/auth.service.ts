import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map, interval, Subscription, delay } from 'rxjs';
import { Router } from '@angular/router';

import { User, LoginRequest, LoginResponse, AuthTokens, BackendAuthResponseDto, LoginDto, LoginOtpDto, LoginResponseDto, IdentityResult } from '../models';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ApiService } from './api.service';
import { UserActivityService } from './user-activity.service';
import { findMockUser, generateMockToken } from '../data/mock-users';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private confirmationDialog = inject(ConfirmationDialogService);
  private apiService = inject(ApiService);

  private readonly TOKEN_KEY = 'hrm_access_token';
  private readonly REFRESH_TOKEN_KEY = 'hrm_refresh_token';
  private readonly USER_KEY = 'hrm_user';

  private userSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive programming
  public user = signal<User | null>(null);
  public isAuthenticated = computed(() => this.user() !== null);
  public isLoading = signal(false);

  private tokenRefreshInterval?: Subscription;
  private tokenCheckInterval?: Subscription;
  private readonly TOKEN_CHECK_INTERVAL = 10000; // Check every 10 seconds (for testing with 1 minute tokens)
  private readonly TOKEN_REFRESH_BEFORE_EXPIRY = 10 * 1000; // Refresh 10 seconds before expiry (for testing)

  private userActivityService = inject(UserActivityService);

  constructor() {
    this.initializeAuth();
    this.startTokenMonitoring();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      // Check if token is expired
      if (this.isTokenExpired()) {
        // Try to refresh token if user is active
        if (this.userActivityService.isUserActive()) {
          this.refreshToken().subscribe({
            next: (response) => {
              if (response && response.token && response.user) {
                const tokens: AuthTokens = {
                  token: response.token,
                  refreshToken: response.refreshToken,
                  expiresAt: response.expiresAt
                };
                this.setAuthData(response.user, tokens);
                this.userSubject.next(response.user);
                this.isAuthenticatedSubject.next(true);
                this.user.set(response.user);
              } else {
                this.userSubject.next(user);
                this.isAuthenticatedSubject.next(true);
                this.user.set(user);
              }
            },
            error: (error) => {
              console.error('Token refresh failed on init:', error);
              // If refresh fails, logout
              this.forceLogout();
            }
          });
        } else {
          // User inactive and token expired, logout
          this.forceLogout();
        }
      } else {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.user.set(user);
      }
    }
  }

  /**
   * Start monitoring token expiration and refresh automatically
   */
  private startTokenMonitoring(): void {
    // Check token expiration periodically
    this.tokenCheckInterval = interval(this.TOKEN_CHECK_INTERVAL).subscribe(() => {
      if (this.isAuthenticated()) {
        const token = this.getToken();
        if (!token) {
          // No token, logout
          this.forceLogout();
          return;
        }

        const isExpired = this.isTokenExpired();
        const isExpiringSoon = this.isTokenExpiringSoon();
        const isUserActive = this.userActivityService.isUserActive();

        if (isExpired) {
          // Token expired, check if user is active
          if (isUserActive) {
            // User is active, try to refresh token
            this.refreshToken().subscribe({
              next: () => {
              },
              error: (error) => {
                console.error('Token refresh failed:', error);
                // Only logout if refresh fails multiple times or user becomes inactive
                // Give it a chance to retry on next interval
                setTimeout(() => {
                  if (!this.userActivityService.isUserActive()) {
                    this.forceLogout();
                  }
                }, 5000); // Wait 5 seconds before checking again
              }
            });
          } else {
            // User inactive and token expired, logout
            this.forceLogout();
          }
        } else if (isExpiringSoon && isUserActive) {
          // Token expiring soon, refresh proactively if user is active
          this.refreshToken().subscribe({
            next: () => {
            },
            error: (error) => {
              // Refresh failed, but don't logout yet (token still valid)
            }
          });
        }
      }
    });
  }

  /**
   * Check if token is expiring soon (within 10 seconds for testing with 1 minute tokens)
   */
  private isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - now;
      // Return true if token expires within 10 seconds (for testing with 1 minute tokens)
      return timeUntilExpiry > 0 && timeUntilExpiry < 10; // 10 seconds
    } catch {
      return false;
    }
  }

  /**
   * Mock login with AccountService API structure for testing
   */
  mockLoginWithAccountApi(loginDto: LoginDto): Observable<LoginResponseDto> {
    this.isLoading.set(true);

    return of(null).pipe(
      delay(500), // Simulate network delay
      map(() => {
        const mockUser = findMockUser(loginDto.usernameEmail, loginDto.password);

        if (!mockUser) {
          const response: LoginResponseDto = {
            result: {
              succeeded: false,
              errors: ['Invalid username or password']
            },
            is2FaRequired: false,
            isMailConfirmed: true
          };
          return response;
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

        const mockToken = generateMockToken(mockUser.user.id);

        const response: LoginResponseDto = {
          result: {
            succeeded: true
          },
          token: mockToken,
          userId: parseInt(mockUser.user.id),
          is2FaRequired: false,
          isMailConfirmed: true
        };

        // Set user data for the login component
        if (response.token && response.userId) {
          const tokens: AuthTokens = {
            token: response.token,
            refreshToken: generateMockToken(mockUser.user.id + '_refresh'),
            expiresAt: expiresAt
          };
          this.setAuthData(mockUser.user, tokens);
          this.userSubject.next(mockUser.user);
          this.isAuthenticatedSubject.next(true);
          this.user.set(mockUser.user);
        }

        return response;
      }),
      tap(() => {
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Mock login error:', error);
        throw error;
      })
    );
  }

  /**
   * Login with AccountService API structure (matching Workflow.Presentation.UI)
   */
  loginWithAccountApi(loginDto: LoginDto): Observable<LoginResponseDto> {
    // Use mock login if mock data is enabled
    if (environment.enableMockData) {
      return this.mockLoginWithAccountApi(loginDto);
    }

    this.isLoading.set(true);
    return this.apiService.post<LoginResponseDto>('/Account/Login', loginDto)
      .pipe(
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Verify OTP for 2FA login
   */
  verifyOtp(loginOtpDto: LoginOtpDto): Observable<IdentityResult> {
    this.isLoading.set(true);
    return this.apiService.post<IdentityResult>('/Account/VerifyLoginOtp', loginOtpDto)
      .pipe(
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Resend mail confirmation
   */
  resendMailConfirmation(usernameEmail: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/Account/ResendConfirmationEmail/${usernameEmail}`);
  }

  /**
   * Mock login for testing without backend
   */
  mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);

    return of(null).pipe(
      delay(500), // Simulate network delay
      map(() => {
        const mockUser = findMockUser(credentials.userName, credentials.password);

        if (!mockUser) {
          throw new Error('Invalid credentials');
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

        const mockToken = generateMockToken(mockUser.user.id);
        const mockRefreshToken = generateMockToken(mockUser.user.id + '_refresh');

        const response: LoginResponse = {
          token: mockToken,
          refreshToken: mockRefreshToken,
          expiresAt: expiresAt,
          user: { ...mockUser.user }
        };

        return response;
      }),
      tap((response: LoginResponse) => {
        if (response && response.token && response.user) {
          const tokens: AuthTokens = {
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: response.expiresAt
          };
          this.setAuthData(response.user, tokens);
          this.userSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          this.user.set(response.user);
          // Start monitoring token expiration after login
          this.startTokenMonitoring();
        }
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Mock login error:', error);
        throw error;
      })
    );
  }

  /**
   * Login with backend API
   * Backend expects Email field, but frontend has userName (can be email or username)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Use mock login if mock data is enabled
    if (environment.enableMockData) {
      return this.mockLogin(credentials);
    }

    this.isLoading.set(true);

    // Backend LoginDto expects Email, so we send the userName as email
    // (Backend can accept either email or username via email field)
    const loginRequest = {
      email: credentials.userName, // Backend expects 'email' field
      password: credentials.password
    };

    return this.apiService.post<BackendAuthResponseDto>('/Auth/login', loginRequest)
      .pipe(
        map((backendResponse: BackendAuthResponseDto) => {
          // Map backend response to frontend LoginResponse format
          const frontendUser: User = {
            id: backendResponse.user.id,
            userName: backendResponse.user.userName,
            email: backendResponse.user.email,
            userFName: backendResponse.user.firstName,
            userLName: backendResponse.user.lastName,
            mobile: backendResponse.user.phoneNumber,
            profileImageUrl: backendResponse.user.profilePictureUrl,
            isActive: backendResponse.user.isActive,
            roles: backendResponse.user.roles || [],
            doctorId: backendResponse.user.doctorId,
            createdAt: backendResponse.user.createdAt ? new Date(backendResponse.user.createdAt) : undefined
          };

          const frontendResponse: LoginResponse = {
            token: backendResponse.accessToken, // Backend uses 'accessToken'
            refreshToken: backendResponse.refreshToken,
            expiresAt: new Date(backendResponse.expiresAt),
            user: frontendUser
          };

          return frontendResponse;
        }),
        tap((response: LoginResponse) => {
          if (response && response.token && response.user) {
            const tokens: AuthTokens = {
              token: response.token,
              refreshToken: response.refreshToken,
              expiresAt: response.expiresAt
            };
            this.setAuthData(response.user, tokens);
            this.userSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
            this.user.set(response.user);
            // Start monitoring token expiration after login
            this.startTokenMonitoring();
          }
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  registerSuperAdmin(data: { email: string; password: string; password_confirm: string }): Observable<any> {
    this.isLoading.set(true);
    return this.apiService.post<any>('/Auth/super-admin-register', data)
      .pipe(
        tap((apiResponse) => {
          // Handle both ApiResponse and direct data, fallback gracefully
          const response = apiResponse?.data || apiResponse;
          if (response && response.user && response.tokens) {
            this.setAuthData(response.user, response.tokens);
            this.userSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
            this.user.set(response.user);
          }
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      // Backend expects RefreshTokenDto with RefreshToken property
      return this.apiService.post('/Auth/logout', { refreshToken: refreshToken })
        .pipe(
          tap(() => {
            this.clearAuthData();
          }),
          catchError((error) => {
            // Even if logout fails on server, clear local data
            this.clearAuthData();
            return of(null);
          })
        );
    } else {
      this.clearAuthData();
      return of(null);
    }
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.forceLogout();
      return of(null as any);
    }

    // Backend will use cookie if available, otherwise use body
    // withCredentials is set by default in ApiService
    return this.apiService.post<BackendAuthResponseDto>('/Auth/refresh',
      refreshToken ? { refreshToken: refreshToken } : {}
    ).pipe(
      map((backendResponse: BackendAuthResponseDto) => {
        // Map backend response to frontend LoginResponse format
        const frontendUser: User = {
          id: backendResponse.user.id,
          userName: backendResponse.user.userName,
          email: backendResponse.user.email,
          userFName: backendResponse.user.firstName,
          userLName: backendResponse.user.lastName,
          mobile: backendResponse.user.phoneNumber,
          profileImageUrl: backendResponse.user.profilePictureUrl,
          isActive: backendResponse.user.isActive,
          roles: backendResponse.user.roles || [],
          doctorId: backendResponse.user.doctorId,
          createdAt: backendResponse.user.createdAt ? new Date(backendResponse.user.createdAt) : undefined
        };

        const frontendResponse: LoginResponse = {
          token: backendResponse.accessToken,
          refreshToken: backendResponse.refreshToken,
          expiresAt: new Date(backendResponse.expiresAt),
          user: frontendUser
        };

        return frontendResponse;
      }),
      tap((response: LoginResponse) => {
        if (response && response.token && response.user) {
          const tokens: AuthTokens = {
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: response.expiresAt
          };
          // Store in localStorage as backup (cookies are primary)
          this.setTokens(tokens);
          this.setUser(response.user);
          // Update user activity
          this.userActivityService.reset();
        }
      }),
      catchError((error) => {
        // If refresh fails, logout
        this.forceLogout();
        throw error;
      })
    );
  }

  register(companyData: any): Observable<any> {
    this.isLoading.set(true);

    return this.apiService.post('/Auth/register', companyData)
      .pipe(
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  isAuthenticatedObservable(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getToken(): string | null {
    // Try to get from cookie first (set by backend), then fallback to localStorage
    const cookieToken = this.getCookie('accessToken');
    if (cookieToken) {
      return cookieToken;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    // Try to get from cookie first (set by backend), then fallback to localStorage
    const cookieToken = this.getCookie('refreshToken');
    if (cookieToken) {
      return cookieToken;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private setAuthData(user: User, tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Update authentication state
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.user.set(user);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    // Store full tokens object for mock token expiration checking
    localStorage.setItem(this.TOKEN_KEY + '_tokens', JSON.stringify(tokens));
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.user.set(user);
  }

  private clearAuthData(): void {
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY + '_tokens');
    localStorage.removeItem(this.USER_KEY);

    // Clear cookies (backend will handle this, but we can also clear client-side)
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');

    // Stop token monitoring
    this.tokenCheckInterval?.unsubscribe();
    this.tokenRefreshInterval?.unsubscribe();

    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.user.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Delete cookie by name
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.some(role => user.roles?.includes(role)) : false;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    // Skip expiration check for mock tokens (no real login logic)
    if (token.startsWith('mock-')) {
      // For mock tokens, check expiresAt if available
      try {
        const tokens = this.getStoredTokens();
        if (tokens && tokens.expiresAt) {
          const now = Date.now();
          const expiresAt = new Date(tokens.expiresAt).getTime();
          return expiresAt < now;
        }
        // If no expiresAt, treat as never expired
        return false;
      } catch {
        // If error, treat as never expired for mock tokens
        return false;
      }
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  // Force logout without server call (for session timeout, etc.)
  forceLogout(): void {
    this.clearAuthData();
  }

  // Logout with confirmation
  logoutWithConfirmation(): Observable<boolean> {
    return this.confirmationDialog.showLogoutConfirmation().pipe(
      tap(confirmed => {
        if (confirmed) {
          this.logout().subscribe();
        }
      }),
      catchError(() => {
        // Fallback to simple confirm if dialog service fails
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
          this.logout().subscribe();
        }
        return of(confirmed);
      })
    );
  }

  // Check if user should be logged out due to inactivity
  checkSessionTimeout(): void {
    const token = this.getToken();
    // Skip session timeout check for mock tokens (no real login logic)
    if (token && token.startsWith('mock-')) {
      return; // Don't check expiration for mock tokens
    }
    if (token && this.isTokenExpired()) {
      this.forceLogout();
    }
  }

  // Get time until token expires (in minutes)
  getTokenExpirationTime(): number {
    const token = this.getToken();
    if (!token) return 0;

    // Handle mock tokens - check expiresAt from stored tokens
    if (token.startsWith('mock-')) {
      try {
        const tokens = this.getStoredTokens();
        if (tokens && tokens.expiresAt) {
          const now = Date.now();
          const expiresAt = new Date(tokens.expiresAt).getTime();
          const timeLeft = expiresAt - now;
          return Math.max(0, Math.floor(timeLeft / (60 * 1000))); // Return minutes
        }
        // If no expiresAt, return a high value so it never expires
        return 999;
      } catch {
        return 999; // Return high value for mock tokens
      }
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const timeLeft = payload.exp - now;
      return Math.max(0, Math.floor(timeLeft / 60)); // Return minutes
    } catch {
      return 0;
    }
  }

  // Get stored tokens (for checking expiration of mock tokens)
  private getStoredTokens(): AuthTokens | null {
    try {
      const tokensStr = localStorage.getItem(this.TOKEN_KEY + '_tokens');
      if (tokensStr) {
        return JSON.parse(tokensStr);
      }
      return null;
    } catch {
      return null;
    }
  }
}

