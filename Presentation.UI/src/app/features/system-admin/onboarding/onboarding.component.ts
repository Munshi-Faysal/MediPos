import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SystemOnboardingService, CompanyRegistration } from '../../../core/services/system-onboarding.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-on-surface">Onboarding</h1>
          <p class="text-on-surface-variant mt-1">Review and manage organization registration requests</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Filter Dropdown -->
          <div class="relative dropdown-container">
            <button
              (click)="toggleStatusDropdown($event)"
              class="flex items-center gap-2 px-5 py-2.5 border border-border rounded-full bg-surface text-on-surface hover:bg-surface-variant transition-all shadow-soft active:scale-95"
              >
              <span class="font-medium">{{ getStatusLabel(selectedStatus()) }}</span>
              <svg
                class="w-4 h-4 ml-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                [class.rotate-180]="showStatusDropdown()"
                >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
    
            <!-- Dropdown Menu -->
            @if (showStatusDropdown()) {
              <div
                class="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-strong z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                <div class="p-1">
                  @for (option of statusOptions; track option) {
                    <button
                      (click)="selectStatus(option.value)"
                      class="w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group"
                      [class.bg-primary-500]="selectedStatus() === option.value"
                      [class.text-white]="selectedStatus() === option.value"
                      [class.text-on-surface-variant]="selectedStatus() !== option.value"
                      [class.hover:bg-surface-variant]="selectedStatus() !== option.value"
                      >
                      <span [class.font-semibold]="selectedStatus() === option.value">{{ option.label }}</span>
                      @if (selectedStatus() === option.value) {
                        <svg
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-surface border border-border rounded-xl p-5 shadow-soft">
          <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Requests</p>
          <p class="text-3xl font-black text-on-surface mt-2">{{ registrations().length }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 shadow-soft">
          <p class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
          <p class="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{{ getCountByStatus('Pending') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 shadow-soft">
          <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved</p>
          <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{{ getCountByStatus('Approved') }}</p>
        </div>
        <div class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 shadow-soft">
          <p class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rejected</p>
          <p class="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{{ getCountByStatus('Rejected') }}</p>
        </div>
      </div>
    
      <!-- Registration List -->
      <div class="space-y-4">
        @for (registration of filteredRegistrations(); track registration) {
          <div
            class="bg-surface border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all group"
            >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <!-- Organization Info -->
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-3 mb-3">
                  <h3 class="text-xl font-bold text-on-surface">{{ registration.organizationName }}</h3>
                  <span
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  [ngClass]="{
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20': registration.approvalStatus === 'Pending',
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20': registration.approvalStatus === 'Approved',
                    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20': registration.approvalStatus === 'Rejected'
                  }"
                    >
                    {{ registration.approvalStatus }}
                  </span>
                  @if (registration.paymentStatus) {
                    <span class="px-3 py-1 rounded-full text-[10px] bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 uppercase font-black tracking-widest">
                      {{ registration.paymentStatus }}
                    </span>
                  }
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <p class="text-on-surface-variant flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-border"></span>
                    <span class="font-medium text-on-surface opacity-60">Email:</span>
                    <span class="text-on-surface">{{ registration.email }}</span>
                  </p>
                  <p class="text-on-surface-variant flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-border"></span>
                    <span class="font-medium text-on-surface opacity-60">Phone:</span>
                    <span class="text-on-surface">{{ registration.phone || 'N/A' }}</span>
                  </p>
                  <p class="text-on-surface-variant flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-border"></span>
                    <span class="font-medium text-on-surface opacity-60">Package:</span>
                    <span class="text-on-surface">{{ registration.packageName }} ({{ registration.packagePrice | currency }})</span>
                  </p>
                  <p class="text-on-surface-variant flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-border"></span>
                    <span class="font-medium text-on-surface opacity-60">Submitted:</span>
                    <span class="text-on-surface">{{ formatDate(registration.createdDate) }}</span>
                  </p>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  (click)="viewDetails(registration)"
                  class="px-5 py-2.5 bg-surface border border-border rounded-lg text-on-surface font-semibold hover:bg-surface-variant transition-all hover:shadow-sm"
                  >
                  View Details
                </button>
                @if (registration.approvalStatus === 'Pending') {
                  <button
                    (click)="openApproveModal(registration)"
                    class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
                    >
                    Approve
                  </button>
                }
                @if (registration.approvalStatus === 'Pending') {
                  <button
                    (click)="openRejectModal(registration)"
                    class="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20"
                    >
                    Reject
                  </button>
                }
              </div>
            </div>
          </div>
        }
    
        <!-- Empty State -->
        @if (filteredRegistrations().length === 0) {
          <div class="text-center py-20 bg-surface/50 rounded-2xl border-2 border-dashed border-border/50">
            <div class="p-4 bg-surface-variant/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-on-surface-variant opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p class="text-xl font-bold text-on-surface">No registrations found</p>
            <p class="text-on-surface-variant mt-2 max-w-sm mx-auto">There are no registration requests matching your current filter criteria.</p>
          </div>
        }
      </div>
    
      <!-- Details Modal -->
      @if (selectedRegistration()) {
        <div
          class="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          (click)="closeDetails()"
          >
          <div
            class="bg-surface border border-border rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300"
            (click)="$event.stopPropagation()"
            >
            <!-- Modal Header -->
            <div class="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-variant/30">
              <div>
                <h2 class="text-2xl font-black text-on-surface">Registration Details</h2>
                <p class="text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-bold">Request ID: #{{ selectedRegistration()?.id }}</p>
              </div>
              <button (click)="closeDetails()" class="p-2 hover:bg-surface-variant rounded-full transition-all text-on-surface-variant hover:text-on-surface">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <!-- Modal Body -->
            <div class="p-8 overflow-y-auto space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="space-y-6">
                  <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] border-b border-primary-500/20 pb-2">Company Information</h3>
                  <div class="space-y-4">
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Organization Name</p>
                      <p class="text-on-surface font-bold text-lg">{{ selectedRegistration()?.organizationName }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Contact Email</p>
                      <p class="text-on-surface font-medium">{{ selectedRegistration()?.email }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Contact Phone</p>
                      <p class="text-on-surface font-medium">{{ selectedRegistration()?.phone || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-6">
                  <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] border-b border-primary-500/20 pb-2">Subscription Info</h3>
                  <div class="space-y-4">
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Selected Package</p>
                      <p class="text-on-surface font-bold text-lg">{{ selectedRegistration()?.packageName }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Package Price</p>
                      <p class="text-on-surface font-black text-xl text-primary-600 dark:text-primary-400">{{ selectedRegistration()?.packagePrice | currency }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Current Status</p>
                      <span class="px-4 py-1 rounded-full text-[10px] font-black bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                        {{ selectedRegistration()?.paymentStatus || 'NOT INITIATED' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              @if (selectedRegistration()?.packageFeatures) {
                <div class="space-y-3 pt-6 border-t border-border">
                  <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Included Features</h3>
                  <div class="bg-surface-variant/40 p-4 rounded-xl text-sm text-on-surface-variant border border-border">
                    {{ selectedRegistration()?.packageFeatures }}
                  </div>
                </div>
              }
              @if (selectedRegistration()?.approvalStatus !== 'Pending') {
                <div class="space-y-6 pt-6 border-t border-border">
                  <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Review Result</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-variant/20 p-5 rounded-xl border border-border">
                    <div>
                      <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Approval Status</p>
                      <p class="font-black uppercase tracking-widest" [class.text-emerald-600]="selectedRegistration()?.approvalStatus === 'Approved'" [class.text-rose-600]="selectedRegistration()?.approvalStatus === 'Rejected'">
                        {{ selectedRegistration()?.approvalStatus }}
                      </p>
                    </div>
                    @if (selectedRegistration()?.billingCycleDate) {
                      <div>
                        <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Billing Start Date</p>
                        <p class="text-on-surface font-bold">{{ formatDate(selectedRegistration()!.billingCycleDate!) }}</p>
                      </div>
                    }
                    @if (selectedRegistration()?.rejectionReason) {
                      <div class="md:col-span-2">
                        <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Reason for Rejection</p>
                        <div class="text-rose-600 dark:text-rose-400 bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 font-medium">
                          {{ selectedRegistration()?.rejectionReason }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            <!-- Modal Footer -->
            @if (selectedRegistration()?.approvalStatus === 'Pending') {
              <div class="px-8 py-6 border-t border-border bg-surface-variant/30 flex gap-4">
                <button
                  (click)="openApproveModal(selectedRegistration()!)"
                  class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
                  >
                  Approve Request
                </button>
                <button
                  (click)="openRejectModal(selectedRegistration()!)"
                  class="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-95"
                  >
                  Reject Request
                </button>
              </div>
            }
          </div>
        </div>
      }
    
      <!-- Approve Modal (Billing Date Selection) -->
      @if (showApproveModal()) {
        <div
          class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-md"
          (click)="closeApproveModal()"
          >
          <div
            class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full p-8 animate-in zoom-in-95 duration-200"
            (click)="$event.stopPropagation()"
            >
            <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-black text-on-surface mb-2">Approve Registration</h3>
            <p class="text-on-surface-variant text-sm mb-8 leading-relaxed">Select the starting date for the billing cycle of <strong class="text-on-surface">{{ registrationToProcess?.organizationName }}</strong>.</p>
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Billing Cycle Start Date</label>
                <input
                  type="date"
                  [(ngModel)]="billingDate"
                  class="form-input"
                  />
                </div>
                <div class="flex gap-4 pt-2">
                  <button
                    (click)="closeApproveModal()"
                    class="flex-1 py-3 border border-border rounded-xl text-on-surface font-bold hover:bg-surface-variant transition-all hover:shadow-sm"
                    >
                    Cancel
                  </button>
                  <button
                    (click)="confirmApprove()"
                    [disabled]="!billingDate || isLoading()"
                    class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
                    >
                    @if (isLoading()) {
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
    
        <!-- Reject Modal -->
        @if (showRejectModal()) {
          <div
            class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-md"
            (click)="closeRejectModal()"
            >
            <div
              class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full p-8 animate-in zoom-in-95 duration-200"
              (click)="$event.stopPropagation()"
              >
              <div class="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                <svg class="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-black text-on-surface mb-2">Reject Request</h3>
              <p class="text-on-surface-variant text-sm mb-8 leading-relaxed">Provide a reason for rejecting the request from <strong class="text-on-surface">{{ registrationToProcess?.organizationName }}</strong>. This will be sent via email.</p>
              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Rejection Reason</label>
                  <textarea
                    [(ngModel)]="rejectionReason"
                    rows="4"
                    class="form-input resize-none"
                    placeholder="Ex: Insufficient documentation or invalid business license..."
                  ></textarea>
                </div>
                <div class="flex gap-4 pt-2">
                  <button
                    (click)="closeRejectModal()"
                    class="flex-1 py-3 border border-border rounded-xl text-on-surface font-bold hover:bg-surface-variant transition-all hover:shadow-sm"
                    >
                    Cancel
                  </button>
                  <button
                    (click)="confirmReject()"
                    [disabled]="!rejectionReason.trim() || isLoading()"
                    class="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-95"
                    >
                    @if (isLoading()) {
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: modalIn 0.2s ease-out; }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class OnboardingComponent implements OnInit {
  private onboardingService = inject(SystemOnboardingService);
  private notificationService = inject(NotificationService);

  public registrations = signal<CompanyRegistration[]>([]);
  public filteredRegistrations = signal<CompanyRegistration[]>([]);
  public selectedRegistration = signal<CompanyRegistration | null>(null);
  public selectedStatus = signal<string>('Pending');
  public showStatusDropdown = signal(false);

  public showApproveModal = signal(false);
  public showRejectModal = signal(false);
  public isLoading = signal(false);

  public billingDate = '';
  public rejectionReason = '';
  public registrationToProcess: CompanyRegistration | null = null;

  public statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Pending', label: 'Pending Approval' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  ngOnInit(): void {
    this.loadRegistrations();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        this.showStatusDropdown.set(false);
      }
    });

    // Default to today for billing date
    const today = new Date().toISOString().split('T')[0];
    this.billingDate = today;
  }

  toggleStatusDropdown(event: Event): void {
    event.stopPropagation();
    this.showStatusDropdown.set(!this.showStatusDropdown());
  }

  selectStatus(value: string): void {
    this.selectedStatus.set(value);
    this.filterByStatus();
    this.showStatusDropdown.set(false);
  }

  getStatusLabel(value: string): string {
    const option = this.statusOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Status';
  }

  loadRegistrations(): void {
    this.isLoading.set(true);
    this.onboardingService.getAllRegistrations().subscribe({
      next: (data) => {
        this.registrations.set(data);
        this.filterByStatus();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load registrations', err);
        this.notificationService.error('Error', 'Failed to load registration requests');
        this.isLoading.set(false);
      }
    });
  }

  filterByStatus(): void {
    const status = this.selectedStatus();
    if (status === 'All') {
      this.filteredRegistrations.set(this.registrations());
    } else {
      this.filteredRegistrations.set(
        this.registrations().filter(r => r.approvalStatus === status)
      );
    }
  }

  getCountByStatus(status: string): number {
    return this.registrations().filter(r => r.approvalStatus === status).length;
  }

  viewDetails(registration: CompanyRegistration): void {
    this.selectedRegistration.set(registration);
  }

  closeDetails(): void {
    this.selectedRegistration.set(null);
  }

  openApproveModal(registration: CompanyRegistration): void {
    this.registrationToProcess = registration;
    this.showApproveModal.set(true);
  }

  closeApproveModal(): void {
    this.showApproveModal.set(false);
    this.registrationToProcess = null;
  }

  confirmApprove(): void {
    if (!this.registrationToProcess || !this.billingDate) return;

    this.isLoading.set(true);
    this.onboardingService.approveRegistration({
      id: this.registrationToProcess.id,
      billingCycleDate: this.billingDate
    }).subscribe({
      next: () => {
        this.notificationService.success('Approved', `Registration for ${this.registrationToProcess?.organizationName} has been approved.`);
        this.loadRegistrations();
        this.closeApproveModal();
        this.closeDetails();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Error', 'Failed to approve registration.');
        this.isLoading.set(false);
      }
    });
  }

  openRejectModal(registration: CompanyRegistration): void {
    this.registrationToProcess = registration;
    this.rejectionReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.registrationToProcess = null;
    this.rejectionReason = '';
  }

  confirmReject(): void {
    if (!this.registrationToProcess || !this.rejectionReason.trim()) return;

    this.isLoading.set(true);
    this.onboardingService.rejectRegistration({
      id: this.registrationToProcess.id,
      reason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.notificationService.success('Rejected', `Registration for ${this.registrationToProcess?.organizationName} has been rejected.`);
        this.loadRegistrations();
        this.closeRejectModal();
        this.closeDetails();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Error', 'Failed to reject registration.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
