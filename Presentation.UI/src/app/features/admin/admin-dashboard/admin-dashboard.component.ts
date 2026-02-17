import { Component, OnInit, signal, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Activity {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timeAgo: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="bg-background">
      <!-- Dashboard Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-on-surface">Admin Dashboard</h1>
        <p class="text-on-surface-variant mt-1">Welcome back, {{ getWelcomeName() }}!</p>
      </div>
    
      <!-- Dashboard Content -->
      <div>
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }
    
        <!-- Admin Statistics Cards -->
        @if (!isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Branches -->
            <div class="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-on-surface-variant">Total Branches</h3>
                    <p class="text-3xl font-bold text-on-surface mt-1">{{ adminStats().totalBranches }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Active Users -->
            <div class="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-on-surface-variant">Active Users</h3>
                    <p class="text-3xl font-bold text-success-600 mt-1">{{ adminStats().activeUsers }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Pending Approvals -->
            <div class="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-on-surface-variant">Pending Approvals</h3>
                    <p class="text-3xl font-bold text-warning-600 mt-1">{{ adminStats().pendingApprovals }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Total Bank Accounts -->
            <div class="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-on-surface-variant">Bank Accounts</h3>
                    <p class="text-3xl font-bold text-purple-600 mt-1">{{ adminStats().totalBankAccounts }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
    
        <!-- Main Content Grid -->
        @if (!isLoading()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Pending Company Approvals -->
            <div class="bg-surface border border-border rounded-lg">
              <div class="px-6 py-4 border-b border-border">
                <h2 class="text-lg font-semibold text-on-surface">Pending Branch Approvals</h2>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  @for (company of pendingCompanies(); track company) {
                    <div class="p-4 bg-surface-variant rounded-lg">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-on-surface truncate">{{ company.name }}</p>
                          <p class="text-sm text-on-surface-variant mt-1 truncate">{{ company.email }}</p>
                          <p class="text-xs text-on-surface-variant mt-1">Submitted {{ company.submittedAgo }}</p>
                        </div>
                        <div class="flex gap-2 sm:ml-4 mt-2 sm:mt-0">
                          <button
                            (click)="approveCompany(company.id)"
                            class="px-3 py-2 text-sm sm:text-xs font-medium bg-success-600 text-white rounded-md hover:bg-success-700 transition-colors whitespace-nowrap">
                            Approve
                          </button>
                          <button
                            (click)="reviewCompany(company.id)"
                            class="px-3 py-2 text-sm sm:text-xs font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap">
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                  @if (pendingCompanies().length === 0) {
                    <div class="text-center py-4">
                      <p class="text-sm text-on-surface-variant">No pending approvals</p>
                    </div>
                  }
                </div>
              </div>
            </div>
            <!-- System Statistics -->
            <div class="bg-surface border border-border rounded-lg">
              <div class="px-6 py-4 border-b border-border">
                <h2 class="text-lg font-semibold text-on-surface">System Statistics</h2>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="flex justify-between items-center py-2 border-b border-border">
                    <span class="text-on-surface-variant">Total Branches</span>
                    <span class="font-semibold text-on-surface">{{ adminStats().totalBranches }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border">
                    <span class="text-on-surface-variant">Active Users</span>
                    <span class="font-semibold text-on-surface">{{ adminStats().activeUsers }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border">
                    <span class="text-on-surface-variant">Pending Approvals</span>
                    <span class="font-semibold text-warning-600">{{ adminStats().pendingApprovals }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border">
                    <span class="text-on-surface-variant">Total Bank Accounts</span>
                    <span class="font-semibold text-on-surface">{{ adminStats().totalBankAccounts }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border">
                    <span class="text-on-surface-variant">Approved Accounts</span>
                    <span class="font-semibold text-success-600">{{ adminStats().approvedAccounts }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-on-surface-variant">Rejected Accounts</span>
                    <span class="font-semibold text-error-600">{{ adminStats().rejectedAccounts }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
    
      </div>
    </div>
    `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);

  public isLoading = signal(false);
  public currentUser = signal<any>(null);
  public currentDate = signal<string>('');

  public adminStats = signal({
    totalBranches: 24,
    activeUsers: 1247,
    pendingApprovals: 5,
    totalBankAccounts: 342,
    approvedAccounts: 298,
    rejectedAccounts: 44
  });

  public pendingCompanies = signal([
    {
      id: '1',
      name: 'Gulshan Branch',
      email: 'gulshan@gmail.com',
      submittedAgo: '2 days ago'
    },
    {
      id: '2',
      name: 'Dhanmondi Branch',
      email: 'dhanmondi@gmail.com',
      submittedAgo: '1 day ago'
    },
    {
      id: '3',
      name: 'Uttara Branch',
      email: 'uttara@gmail.com',
      submittedAgo: '3 days ago'
    }
  ]);

  public recentActivity = signal<Activity[]>([
    {
      title: 'Company Approved',
      message: 'Company "DataFlow Systems" has been approved and activated',
      type: 'success',
      timeAgo: '2 hours ago'
    },
    {
      title: 'New Registration',
      message: 'New company registration from "CloudTech Solutions"',
      type: 'info',
      timeAgo: '4 hours ago'
    },
    {
      title: 'User Created',
      message: 'New admin user "john.doe" has been created',
      type: 'success',
      timeAgo: '6 hours ago'
    },
    {
      title: 'System Maintenance',
      message: 'Scheduled system maintenance completed successfully',
      type: 'info',
      timeAgo: '1 day ago'
    }
  ]);

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.currentDate.set(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    // Load admin dashboard data
    this.loadAdminData();
  }

  getWelcomeName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'Admin';
    
    // For Admin users, show "Admin" instead of full name
    if (user.roles && user.roles.includes('Admin')) {
      return 'Admin';
    }
    
    // For System-Admin, show "System Administrator"
    if (user.roles && user.roles.includes('System-Admin')) {
      return 'System Administrator';
    }
    
    // For other users, use display name
    return this.getUserDisplayName();
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'Administrator';
    
    if (user.userFName && user.userLName) {
      return `${user.userFName} ${user.userLName}`;
    } else if (user.userName) {
      return user.userName;
    }
    
    return 'Administrator';
  }

  loadAdminData(): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  approveCompany(companyId: string): void {
    console.log('Approving company:', companyId);
    // Remove from pending list
    const pending = this.pendingCompanies().filter(c => c.id !== companyId);
    this.pendingCompanies.set(pending);
    
    // Update stats
    const stats = this.adminStats();
    stats.pendingApprovals = Math.max(0, stats.pendingApprovals - 1);
    stats.totalBranches += 1;
    this.adminStats.set({ ...stats });
    
    // Add to recent activity
    const activity = this.recentActivity();
    const newActivity: Activity = {
      title: 'Company Approved',
      message: `Company has been approved and activated`,
      type: 'success',
      timeAgo: 'Just now'
    };
    this.recentActivity.set([newActivity, ...activity]);
  }

  reviewCompany(companyId: string): void {
    console.log('Reviewing company:', companyId);
    // Navigate to company details or open review modal
  }
}


