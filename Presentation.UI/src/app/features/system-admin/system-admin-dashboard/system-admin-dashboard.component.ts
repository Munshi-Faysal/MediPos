import { Component, signal, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { DashboardService, SystemAdminDashboardStats } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-system-admin-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-on-surface">System Administration Dashboard</h1>
        <p class="text-on-surface-variant mt-2">Manage bank onboarding and system configurations</p>
      </div>
    
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Pending Onboarding -->
        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-on-surface-variant">Pending Onboarding</p>
              <p class="text-3xl font-bold text-on-surface mt-2">{{ stats().pendingOnboarding }}</p>
            </div>
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
    
        <!-- Approved Banks -->
        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-on-surface-variant">Approved Banks</p>
              <p class="text-3xl font-bold text-on-surface mt-2">{{ stats().approvedBanks }}</p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
    
        <!-- Rejected Banks -->
        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-on-surface-variant">Rejected Banks</p>
              <p class="text-3xl font-bold text-on-surface mt-2">{{ stats().rejectedBanks }}</p>
            </div>
            <div class="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>
    
        <!-- Total Banks -->
        <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-on-surface-variant">Total Banks</p>
              <p class="text-3xl font-bold text-on-surface mt-2">{{ stats().totalBanks }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Quick Actions -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            routerLink="/system-admin/onboarding"
            class="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-surface-variant transition-colors"
            >
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-on-surface">Review Onboarding Requests</h3>
              <p class="text-sm text-on-surface-variant">View and manage bank registration requests</p>
            </div>
          </a>
    
          <div class="flex items-center gap-4 p-4 border border-border rounded-lg cursor-not-allowed opacity-60">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-on-surface">System Settings</h3>
              <p class="text-sm text-on-surface-variant">Configure system-wide settings</p>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Recent Activity -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-on-surface mb-4">Recent Activity</h2>
        <div class="space-y-4">
          @for (activity of recentActivity(); track activity) {
            <div class="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                [class.bg-success-100]="activity.type === 'approved'"
                [class.bg-warning-100]="activity.type === 'pending'"
                [class.bg-error-100]="activity.type === 'rejected'">
                @if (activity.type === 'approved') {
                  <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                }
                @if (activity.type === 'pending') {
                  <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                @if (activity.type === 'rejected') {
                  <svg class="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                }
              </div>
              <div class="flex-1">
                <p class="font-medium text-on-surface">{{ activity.message }}</p>
                <p class="text-sm text-on-surface-variant">{{ activity.timestamp }}</p>
              </div>
            </div>
          }
    
          @if (recentActivity().length === 0) {
            <div class="text-center py-8 text-on-surface-variant">
              No recent activity found.
            </div>
          }
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class SystemAdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  public stats = signal<SystemAdminDashboardStats>({
    pendingOnboarding: 0,
    approvedBanks: 0,
    rejectedBanks: 0,
    totalBanks: 0,
    recentActivities: []
  });

  public recentActivity = signal<any[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getSystemAdminStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.recentActivity.set(data.recentActivities);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      }
    });
  }
}

