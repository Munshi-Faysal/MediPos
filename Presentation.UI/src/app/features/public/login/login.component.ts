import { Component, OnInit, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';
import { LoginDto, LoginOtpDto, LoginResponseDto, IdentityResult, User } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private apiService = inject(ApiService);

  public loginData = {
    usernameEmail: '',
    password: '',
    rememberMe: false
  };

  public errors: Record<string, string> = {};
  public isLoading = signal(false);
  public errorMessage = signal('');
  public showPassword = signal(false);
  public isOtpRequired = signal(false);
  public isMailConfirmed = signal(true);
  public validationErrors = signal<string[]>([]);

  private userId: number | undefined;
  private jwtToken: string | undefined;
  private returnUrl: string | undefined;
  private deviceId: string;

  constructor() {
    // Generate or retrieve device ID (must be a valid GUID/UUID)
    const storedDeviceId = localStorage.getItem('deviceId');
    if (storedDeviceId && this.isValidGuid(storedDeviceId)) {
      this.deviceId = storedDeviceId;
    } else {
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('deviceId', this.deviceId);
    }
  }

  ngOnInit(): void {
    // Initialize theme
    this.themeService.setTheme(this.themeService.getTheme());

    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
  }

  onSubmit(): void {
    // Clear previous errors
    this.clearErrors();

    if (this.isOtpRequired()) {
      this.handleOtpVerification();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin(): void {

    debugger;
    // Validate inputs
    if (!this.loginData.usernameEmail || !this.loginData.password) {
      this.errorMessage.set('Please enter both username/email and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Ensure deviceId is set (required by API)
    if (!this.deviceId) {
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('deviceId', this.deviceId);
    }

    // Prepare LoginDto matching UI project API structure
    const loginDto: LoginDto = {
      usernameEmail: this.loginData.usernameEmail,
      password: this.loginData.password,
      deviceId: this.deviceId, // Required - must be a valid GUID
      trustDevice: this.loginData.rememberMe || false,
    };

    console.log('Login request:', { ...loginDto, password: '***' }); // Debug log

    // Call new API method matching UI project
    this.authService.loginWithAccountApi(loginDto).subscribe({
      next: (response: LoginResponseDto) => {
        this.isLoading.set(false);

        if (response.result.succeeded) {
          if (!response.is2FaRequired) {
            // No 2FA required, complete login
            if (response.token && response.userId) {
              // Store token using Client project's key for consistency
              localStorage.setItem('hrm_access_token', response.token);
              localStorage.setItem('userId', response.userId.toString());

              // Also store as access_token for compatibility with UI project structure
              localStorage.setItem('access_token', response.token);

              // Fetch user details and set in AuthService so AuthGuard can verify
              this.fetchAndSetUser(response.userId.toString(), response.token);
            }
          } else {
            // 2FA required, show OTP input
            this.userId = response.userId;
            this.jwtToken = response.token;
            this.isOtpRequired.set(true);
          }
        } else {
          // Login failed
          this.errorMessage.set('Login failed. Please check your credentials.');
          if (response.result.errors) {
            this.validationErrors.set(response.result.errors);
          }
          this.isMailConfirmed.set(response.isMailConfirmed);

          if (!response.isMailConfirmed) {
            this.notificationService.error('Error', 'Email Not Confirmed!');
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);

        // Handle different error types
        let errorMsg = 'Login failed. Please try again.';

        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (error?.status === 401) {
          errorMsg = 'Invalid username or password';
        } else if (error?.status === 0) {
          errorMsg = 'Unable to connect to server. Please check your connection.';
        }

        this.errorMessage.set(errorMsg);
        this.notificationService.error('Error', errorMsg);
      }
    });
  }

  private handleOtpVerification(): void {
    // This would need an OTP input field in the template
    // For now, this is a placeholder for 2FA support
    const otpValue = (document.getElementById('otp') as HTMLInputElement)?.value;
    if (!otpValue || otpValue.length !== 6) {
      this.errorMessage.set('Please enter a valid 6-digit OTP');
      return;
    }

    this.isLoading.set(true);
    const trustDevice = this.loginData.rememberMe || false;

    // Get browser and OS info
    const browserInfo = this.getBrowserInfo();
    const osInfo = this.getOSInfo();

    const loginOtpDto: LoginOtpDto = {
      userId: this.userId!,
      deviceId: trustDevice ? this.deviceId : null,
      browser: trustDevice ? browserInfo : null,
      operatingSystem: trustDevice ? osInfo : null,
      otp: parseInt(otpValue, 10),
    };

    this.authService.verifyOtp(loginOtpDto).subscribe({
      next: (response: IdentityResult) => {
        this.isLoading.set(false);

        if (response.succeeded) {
          if (this.jwtToken && this.userId) {
            localStorage.setItem('hrm_access_token', this.jwtToken);
            localStorage.setItem('userId', this.userId.toString());
            localStorage.setItem('access_token', this.jwtToken);

            this.notificationService.success('Success', 'Login successful!');

            // Fetch user details to determine role-based redirection
            this.fetchAndSetUser(this.userId.toString(), this.jwtToken);
          } else {
            this.notificationService.error('Error', 'Authentication Failed!');
            this.errorMessage.set('Authentication failed. Please try again.');
          }
        } else {
          this.notificationService.error('Error', 'Authentication Failed!');
          this.errorMessage.set('Invalid OTP. Please try again.');
          if (response.errors) {
            this.validationErrors.set(response.errors);
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('OTP verification error:', error);
        this.notificationService.error('Error', 'Authentication Failed!');
        this.errorMessage.set('OTP verification failed. Please try again.');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  resendMailConfirmation(): void {
    if (!this.loginData.usernameEmail) {
      this.notificationService.warning('Warning', 'Please enter your email address first');
      return;
    }

    this.authService.resendMailConfirmation(this.loginData.usernameEmail).subscribe({
      next: () => {
        this.notificationService.success('Success', 'We have sent a confirmation mail to the corresponding email address. Check your email to confirm.');
        this.isMailConfirmed.set(true);
      },
      error: (error) => {
        console.error('Resend confirmation error:', error);
        this.notificationService.error('Error', 'Failed to resend confirmation email. Please try again.');
      }
    });
  }

  private clearErrors(): void {
    this.errors = {};
    this.errorMessage.set('');
    this.validationErrors.set([]);
  }

  private generateDeviceId(): string {
    // Generate a UUID v4 format (GUID) for device ID
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private isValidGuid(guid: string): boolean {
    // Validate GUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  }

  private fetchAndSetUser(userId: string, token: string): void {
    // Try to get user details from API
    // First try /User/GetCurrentUser (UI project endpoint)
    this.apiService.get<any>('/User/GetCurrentUser').pipe(
      catchError(() => {
        // If that fails, try /v1/users/{userId}
        return this.apiService.get<any>(`/v1/users/${userId}`);
      }),
      catchError(() => {
        // If both fail, create a minimal user object from available data
        return of(null);
      })
    ).subscribe({
      next: (userData: any) => {
        let user: User;
        if (userData) {
          // Map API response to User interface
          user = {
            id: userData.id || userId,
            userName: userData.userName || userData.email?.split('@')[0] || '',
            email: userData.email || this.loginData.usernameEmail,
            userFName: userData.firstName || userData.userFName || '',
            userLName: userData.lastName || userData.userLName || '',
            mobile: userData.phoneNumber || userData.phone || userData.mobile,
            profileImageUrl: userData.profilePictureUrl || userData.profileImageUrl,
            isActive: userData.isActive !== false,
            roles: userData.roles || [],
            branchId: userData.branchId,
            doctorId: userData.doctorId,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date()
          };

          // Set user in AuthService
          this.authService.setUser(user);
        } else {
          // Create minimal user object if API call fails
          user = {
            id: userId,
            userName: this.loginData.usernameEmail.split('@')[0] || this.loginData.usernameEmail,
            email: this.loginData.usernameEmail,
            userFName: '',
            userLName: '',
            isActive: true,
            roles: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.authService.setUser(user);
        }

        // Navigate after user is set - determine dashboard route by role
        this.notificationService.success('Success', 'Login successful!');

        // Use specifically determined dashboard route or returnUrl
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.router.navigate([this.getDashboardRoute(user)]);
        }
      },
      error: (error) => {
        console.error('Failed to fetch user details:', error);
        // Create minimal user object on error
        const minimalUser: User = {
          id: userId,
          userName: this.loginData.usernameEmail.split('@')[0] || this.loginData.usernameEmail,
          email: this.loginData.usernameEmail,
          userFName: '',
          userLName: '',
          isActive: true,
          roles: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.authService.setUser(minimalUser);

        this.notificationService.success('Success', 'Login successful!');
        this.router.navigate([this.getDashboardRoute(minimalUser)]);
      }
    });
  }

  private getDashboardRoute(user: User): string {
    const roles = user.roles || [];

    const normalizedRoles = roles.map(r => r.toLowerCase());

    if (normalizedRoles.includes('system-admin') || normalizedRoles.includes('systemadmin')) {
      return '/system-admin';
    } else if (normalizedRoles.includes('admin')) {
      return '/admin';
    } else if (normalizedRoles.includes('doctor')) {
      return '/doctor/dashboard';
    }

    return '/'; // Default fallback
  }
}
