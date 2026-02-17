import { Component, signal, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-on-surface">Profile</h1>
        <p class="text-on-surface-variant mt-2">Manage your account information and preferences</p>
      </div>
    
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <div class="text-center">
              <!-- Avatar -->
              <div class="flex justify-center mb-4">
                <div class="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {{ getUserInitials() }}
                </div>
              </div>
    
              <!-- User Name -->
              <h2 class="text-xl font-semibold text-on-surface mb-1">{{ getUserDisplayName() }}</h2>
              <p class="text-sm text-on-surface-variant mb-2">{{ getUserEmail() }}</p>
              <p class="text-sm text-primary-600 font-medium mb-4">{{ getUserRole() }}</p>
    
              <!-- Branch (if available) -->
              @if (getUserBranch()) {
                <div class="mb-4">
                  <p class="text-xs text-on-surface-variant">Branch</p>
                  <p class="text-sm font-medium text-on-surface">{{ getUserBranch() }}</p>
                </div>
              }
    
              <!-- Status Badge -->
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-success-100 rounded-full">
                <div class="w-2 h-2 bg-success-600 rounded-full"></div>
                <span class="text-sm font-medium text-success-700">Active</span>
              </div>
            </div>
          </div>
    
          <!-- Quick Stats -->
          <div class="bg-surface border border-border rounded-lg p-6 shadow-sm mt-6">
            <h3 class="text-lg font-semibold text-on-surface mb-4">Quick Stats</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-on-surface-variant">Member Since</span>
                <span class="text-sm font-medium text-on-surface">{{ formatDate(userProfile().createdAt) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-on-surface-variant">Last Login</span>
                <span class="text-sm font-medium text-on-surface">{{ formatDate(userProfile().lastLoginAt) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-on-surface-variant">Total Sessions</span>
                <span class="text-sm font-medium text-on-surface">{{ userProfile().totalSessions }}</span>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Right Column - Profile Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personal Information -->
          <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-on-surface mb-6">Personal Information</h3>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name -->
                <div>
                  <label class="block text-sm font-semibold text-on-surface mb-2">
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="firstName"
                    class="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    [class.border-red-500]="isFieldInvalid('firstName')"
                    />
                    @if (isFieldInvalid('firstName')) {
                      <div class="mt-1 text-sm text-red-600">
                        First name is required
                      </div>
                    }
                  </div>
    
                  <!-- Last Name -->
                  <div>
                    <label class="block text-sm font-semibold text-on-surface mb-2">
                      Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      [class.border-red-500]="isFieldInvalid('lastName')"
                      />
                      @if (isFieldInvalid('lastName')) {
                        <div class="mt-1 text-sm text-red-600">
                          Last name is required
                        </div>
                      }
                    </div>
    
                    <!-- Email -->
                    <div>
                      <label class="block text-sm font-semibold text-on-surface mb-2">
                        Email Address <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        formControlName="email"
                        class="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        [class.border-red-500]="isFieldInvalid('email')"
                        />
                        @if (isFieldInvalid('email')) {
                          <div class="mt-1 text-sm text-red-600">
                            {{ getFieldError('email') }}
                          </div>
                        }
                      </div>
    
                      <!-- Phone -->
                      <div>
                        <label class="block text-sm font-semibold text-on-surface mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          formControlName="phone"
                          class="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
    
                        <!-- Username -->
                        <div>
                          <label class="block text-sm font-semibold text-on-surface mb-2">
                            Username <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            formControlName="userName"
                            class="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 cursor-not-allowed"
                            readonly
                            />
                            <p class="text-xs text-on-surface-variant mt-1">Username cannot be changed</p>
                          </div>
    
                          <!-- Role -->
                          <div>
                            <label class="block text-sm font-semibold text-on-surface mb-2">
                              Role
                            </label>
                            <input
                              type="text"
                              [value]="getUserRole()"
                              class="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 cursor-not-allowed"
                              readonly
                              />
                            </div>
                          </div>
    
                          <!-- Branch (if available) -->
                          @if (getUserBranch()) {
                            <div>
                              <label class="block text-sm font-semibold text-on-surface mb-2">
                                Branch
                              </label>
                              <input
                                type="text"
                                [value]="getUserBranch()"
                                class="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 cursor-not-allowed"
                                readonly
                                />
                              </div>
                            }
    
                            <!-- Submit Button -->
                            <div class="flex justify-end gap-4 pt-4 border-t border-border">
                              <button
                                type="button"
                                routerLink="/admin"
                                class="px-6 py-2 border border-border rounded-lg text-on-surface hover:bg-surface-variant transition-colors"
                                >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                [disabled]="profileForm.invalid || isSaving()"
                                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                @if (!isSaving()) {
                                  <span>Save Changes</span>
                                }
                                @if (isSaving()) {
                                  <span class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                  </span>
                                }
                              </button>
                            </div>
                          </form>
                        </div>
    
                        <!-- Security Settings -->
                        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
                          <h3 class="text-xl font-semibold text-on-surface mb-6">Security Settings</h3>
                          <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 border border-border rounded-lg">
                              <div>
                                <h4 class="font-semibold text-on-surface">Change Password</h4>
                                <p class="text-sm text-on-surface-variant">Update your password to keep your account secure</p>
                              </div>
                              <button
                                class="px-4 py-2 border border-border rounded-lg text-on-surface hover:bg-surface-variant transition-colors"
                                >
                                Change Password
                              </button>
                            </div>
    
                            <div class="flex items-center justify-between p-4 border border-border rounded-lg">
                              <div>
                                <h4 class="font-semibold text-on-surface">Two-Factor Authentication</h4>
                                <p class="text-sm text-on-surface-variant">Add an extra layer of security to your account</p>
                              </div>
                              <button
                                class="px-4 py-2 border border-border rounded-lg text-on-surface hover:bg-surface-variant transition-colors"
                                >
                                Enable 2FA
                              </button>
                            </div>
                          </div>
                        </div>
    
                        <!-- Activity Log -->
                        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
                          <h3 class="text-xl font-semibold text-on-surface mb-6">Recent Activity</h3>
                          <div class="space-y-4">
                            @for (activity of recentActivity(); track activity) {
                              <div class="flex items-start gap-4 p-4 border border-border rounded-lg">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center"
                                  [class.bg-success-100]="activity.type === 'success'"
                                  [class.bg-primary-100]="activity.type === 'info'"
                                  [class.bg-warning-100]="activity.type === 'warning'">
                                  @if (activity.type === 'success') {
                                    <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  }
                                  @if (activity.type === 'info') {
                                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                  }
                                  @if (activity.type === 'warning') {
                                    <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                  }
                                </div>
                                <div class="flex-1">
                                  <p class="font-medium text-on-surface">{{ activity.title }}</p>
                                  <p class="text-sm text-on-surface-variant mt-1">{{ activity.message }}</p>
                                  <p class="text-xs text-on-surface-variant mt-1">{{ activity.timeAgo }}</p>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
    `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  public profileForm: FormGroup;
  public isSaving = signal(false);
  public userProfile = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userName: '',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    totalSessions: 0
  });

  public recentActivity = signal([
    {
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully',
      timeAgo: '2 hours ago'
    },
    {
      type: 'info',
      title: 'Login',
      message: 'You logged in from a new device',
      timeAgo: '1 day ago'
    },
    {
      type: 'warning',
      title: 'Password Change',
      message: 'Your password was changed',
      timeAgo: '5 days ago'
    }
  ]);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      userName: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Mock profile data
      const mockProfile = {
        firstName: user.userFName || 'Admin',
        lastName: user.userLName || 'User',
        email: user.email || 'admin@gbaccount.com',
        phone: user.mobile || '',
        userName: user.userName || 'admin',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        totalSessions: 142
      };
      
      this.userProfile.set(mockProfile);
      
      // Populate form
      this.profileForm.patchValue({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        phone: mockProfile.phone,
        userName: mockProfile.userName
      });
    }
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'U';
    
    if (user.roles && user.roles.includes('Admin')) {
      return 'A';
    }
    
    if (user.roles && user.roles.includes('System-Admin')) {
      return 'SA';
    }
    
    const firstName = user.userFName || '';
    const lastName = user.userLName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    return 'U';
  }

  getUserDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'User';
    
    if (user.roles && user.roles.includes('Admin')) {
      return 'Admin';
    }
    
    if (user.roles && user.roles.includes('System-Admin')) {
      return 'System Administrator';
    }
    
    if (user.userFName && user.userLName) {
      return `${user.userFName} ${user.userLName}`;
    }
    
    return user.userName || 'User';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'user@example.com';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user || !user.roles || user.roles.length === 0) return 'Employee';
    
    const role = user.roles[0] || 'Employee';
    
    if (role === 'Admin') {
      return 'Admin';
    } else if (role === 'System-Admin') {
      return 'System Administrator';
    }
    
    return role;
  }

  getUserBranch(): string {
    const user = this.authService.getCurrentUser();
    if (!user || !user.branchId) return '';
    
    // Mock branch data
    const branches: any[] = [
      { id: '1', name: 'Head Office' },
      { id: '2', name: 'Downtown Branch' },
      { id: '3', name: 'Uptown Branch' },
      { id: '4', name: 'Westside Branch' }
    ];
    
    const branch = branches.find(b => b.id === user.branchId);
    return branch ? branch.name : '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Profile updated:', this.profileForm.value);
        this.isSaving.set(false);
        
        // Update user profile signal
        this.userProfile.set({
          ...this.userProfile(),
          firstName: this.profileForm.value.firstName,
          lastName: this.profileForm.value.lastName,
          email: this.profileForm.value.email,
          phone: this.profileForm.value.phone
        });
        
        // Show success message (you can use a notification service here)
        alert('Profile updated successfully!');
      }, 1000);
    } else {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }
}
