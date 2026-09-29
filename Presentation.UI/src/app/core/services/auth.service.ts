import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, map, interval, Subscription, delay, from, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { User, LoginRequest, LoginResponse, AuthTokens, BackendAuthResponseDto, LoginDto, LoginOtpDto, LoginResponseDto, IdentityResult } from '../models';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ApiService } from './api.service';
import { findMockUser, generateMockToken } from '../data/mock-users';
import { environment } from '../../../environments/environment';
import { confirmAppAction } from '../utils/app-alert';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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

  private tokenCheckInterval?: Subscription;
  private readonly TOKEN_CHECK_INTERVAL = 30 * 1000;
  private readonly TOKEN_REFRESH_BEFORE_EXPIRY = 2 * 60 * 1000;

  constructor() {
    this.clearLegacyPersistentAuthData();
    this.initializeAuth();
    this.startTokenMonitoring();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.userSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.user.set(user);

      if (this.isTokenExpired()) {
        this.refreshToken().subscribe({
          error: (error) => console.error('Token refresh failed on init:', error)
        });
      }
    }
  }

  /**
   * Start monitoring token expiration and refresh automatically
   */
  private startTokenMonitoring(): void {
    if (this.tokenCheckInterval && !this.tokenCheckInterval.closed) {
      return;
    }

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
        // Always try to refresh, ignore user activity to keep session alive
        const shouldRefresh = isExpired || isExpiringSoon;

        if (shouldRefresh) {
          // Try to refresh token
          this.refreshToken().subscribe({
            next: () => {
            },
            error: (error) => {
              console.error('Token refresh failed:', error);
              // Transient failures are retried on the next interval. Invalid
              // refresh tokens are cleared by refreshToken().
            }
          });
        }
      }
    });
  }

  private isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - now;
      return timeUntilExpiry > 0 && timeUntilExpiry * 1000 < this.TOKEN_REFRESH_BEFORE_EXPIRY;
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
    this.clearAuthData();
    return of(null);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.forceLogout();
      return throwError(() => new Error('No refresh token is available.'));
    }

    return this.apiService.post<LoginResponseDto>('/Account/RefreshToken', { refreshToken }).pipe(
      map((response: LoginResponseDto) => {
        const user = this.getCurrentUser() ?? this.getStoredUser();
        if (!response.result.succeeded || !response.token || !response.refreshToken || !user) {
          throw new Error('The server returned an invalid token refresh response.');
        }

        return {
          token: response.token,
          refreshToken: response.refreshToken,
          expiresAt: this.getTokenExpirationDate(response.token),
          user
        };
      }),
      tap((response: LoginResponse) => {
        if (response && response.token && response.user) {
          const tokens: AuthTokens = {
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: response.expiresAt
          };
          this.setTokens(tokens);
          this.setUser(response.user);
        }
      }),
      catchError((error) => {
        // Invalid/expired credentials end the session. Network/server outages do
        // not erase it, so the next monitoring cycle can retry.
        if (error?.status === 400 || error?.status === 401 || error?.status === 403) {
          this.forceLogout();
        }
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

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return this.apiService.post<boolean>('/Account/ChangePassword', {
      currentPassword,
      newPassword
    });
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
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setSessionTokens(token: string, refreshToken: string): void {
    this.setTokens({
      token,
      refreshToken,
      expiresAt: this.getTokenExpirationDate(token)
    });
    this.startTokenMonitoring();
  }

  private setAuthData(user: User, tokens: AuthTokens): void {
    sessionStorage.setItem(this.TOKEN_KEY, tokens.token);
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Update authentication state
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.user.set(user);
  }

  setTokens(tokens: AuthTokens): void {
    sessionStorage.setItem(this.TOKEN_KEY, tokens.token);
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    // Store full tokens object for mock token expiration checking
    sessionStorage.setItem(this.TOKEN_KEY + '_tokens', JSON.stringify(tokens));
  }

  setUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.user.set(user);
    this.startTokenMonitoring();
  }

  private clearAuthData(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY + '_tokens');
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('userId');

    this.clearLegacyPersistentAuthData();

    // Clear cookies (backend will handle this, but we can also clear client-side)
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');

    // Stop token monitoring
    this.tokenCheckInterval?.unsubscribe();
    this.tokenCheckInterval = undefined;

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
    const userStr = sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private getTokenExpirationDate(token: string): Date {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (typeof payload.exp === 'number') {
        return new Date(payload.exp * 1000);
      }
    } catch {
      // The backend remains the source of truth; use its access-token lifetime
      // as a safe local fallback if the payload cannot be decoded.
    }

    return new Date(Date.now() + 30 * 60 * 1000);
  }

  private clearLegacyPersistentAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY + '_tokens');
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.some(role => user.roles?.includes(role)) : false;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some(r => {
      const norm = r.toLowerCase().replace(/[-_ ]/g, '');
      return norm === 'systemadmin' || norm === 'superadmin';
    });
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
      catchError(() => from(confirmAppAction({
        title: 'Sign out?',
        text: 'Are you sure you want to logout?',
        confirmButtonText: 'Yes, sign out',
        confirmButtonColor: '#6d28d9'
      })).pipe(
        tap(confirmed => {
          if (confirmed) {
            this.logout().subscribe();
          }
        })
      ))
    );
  }

  // Renew an expired access token while the browser session is still open.
  checkSessionTimeout(): void {
    const token = this.getToken();
    // Skip session timeout check for mock tokens (no real login logic)
    if (token && token.startsWith('mock-')) {
      return; // Don't check expiration for mock tokens
    }
    if (token && this.isTokenExpired()) {
      this.refreshToken().subscribe({
        error: (error) => console.error('Session renewal failed:', error)
      });
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
      const tokensStr = sessionStorage.getItem(this.TOKEN_KEY + '_tokens');
      if (tokensStr) {
        return JSON.parse(tokensStr);
      }
      return null;
    } catch {
      return null;
    }
  }
}

