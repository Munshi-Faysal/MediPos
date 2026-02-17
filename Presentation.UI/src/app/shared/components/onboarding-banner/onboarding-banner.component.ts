import { Component, OnInit, signal, computed, inject } from '@angular/core';

import { Router } from '@angular/router';

import { TenantService } from '../../../core/services/tenant.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OnboardingStepService, OnboardingStepDto } from '../../../core/services/onboarding-step.service';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-onboarding-banner',
  standalone: true,
  imports: [],
  template: `
    @if (showBanner()) {
      <div class="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 border border-primary-200 dark:border-primary-700 rounded-lg p-6 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-on-surface mb-2">Complete Your Setup</h3>
              <p class="text-on-surface-variant mb-4">
                Welcome to HRM System! Complete these steps to get your organization fully configured.
              </p>
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-sm text-on-surface-variant mb-2">
                  <span>Setup Progress</span>
                  <span>{{ completedSteps() }} of {{ totalSteps() }} completed</span>
                </div>
                <div class="w-full bg-surface-variant rounded-full h-2">
                  <div
                    class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="progressPercentage()"
                  ></div>
                </div>
              </div>
              <!-- Steps List -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (step of onboardingSteps(); track step) {
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    [class.bg-surface]="!step.completed"
                    [class.bg-success-50]="step.completed"
                    [class.border]="!step.completed"
                    [class.border-border]="!step.completed"
                    [class.border-success-200]="step.completed"
                    >
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      [class.bg-primary-100]="!step.completed"
                      [class.bg-success-100]="step.completed">
                      @if (step.completed) {
                        <svg class="h-4 w-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      }
                      @if (!step.completed) {
                        <svg class="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="step.icon"></path>
                        </svg>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-on-surface">{{ step.title }}</h4>
                      <p class="text-xs text-on-surface-variant">{{ step.description }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              (click)="dismissBanner()"
              class="btn-ghost p-2"
              title="Dismiss banner"
              >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <button
              (click)="goToOnboarding()"
              class="btn-primary"
              [disabled]="isCompleted()"
              >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              {{ isCompleted() ? 'Setup Complete' : 'Continue Setup' }}
            </button>
          </div>
        </div>
      </div>
    }
    `,
  styles: []
})
export class OnboardingBannerComponent implements OnInit {
  tenantService = inject(TenantService);
  notificationService = inject(NotificationService);
  private onboardingStepService = inject(OnboardingStepService);
  private router = inject(Router);

  public onboardingSteps = signal<OnboardingStep[]>([]);
  public showBanner = signal(true);
  public isLoading = signal(false);

  ngOnInit(): void {
    this.loadOnboardingStatus();
  }

  public completedSteps = computed(() => {
    return this.onboardingSteps().filter(step => step.completed).length;
  });

  public totalSteps = computed(() => {
    return this.onboardingSteps().length;
  });

  public progressPercentage = computed(() => {
    if (this.totalSteps() === 0) return 0;
    return (this.completedSteps() / this.totalSteps()) * 100;
  });

  public isCompleted = computed(() => {
    return this.completedSteps() === this.totalSteps();
  });

  private loadOnboardingStatus(): void {
    this.isLoading.set(true);
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('onboarding_banner_dismissed');
    if (dismissed === 'true') {
      this.showBanner.set(false);
      this.isLoading.set(false);
      return;
    }
    
    this.onboardingStepService.getOnboardingStatus().subscribe({
      next: (status) => {
        const steps: OnboardingStep[] = status.steps.map(step => ({
          id: step.stepKey,
          title: step.title,
          description: step.description || '',
          completed: step.completed,
          route: step.route || '/app/settings/onboarding',
          icon: step.icon || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        }));
        this.onboardingSteps.set(steps);
        this.showBanner.set(!status.isCompleted);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load onboarding status:', error);
        this.isLoading.set(false);
        // Hide banner on error
        this.showBanner.set(false);
      }
    });
  }

  goToOnboarding(): void {
    if (this.isCompleted()) {
      this.notificationService.success('Setup Complete', 'Your organization setup is complete!');
      this.dismissBanner();
      return;
    }

    // Find the first incomplete step
    const nextStep = this.onboardingSteps().find(step => !step.completed);
    if (nextStep) {
      this.router.navigate([nextStep.route]);
    }
  }

  dismissBanner(): void {
    this.showBanner.set(false);
    // In a real app, you might want to persist this dismissal
    localStorage.setItem('onboarding_banner_dismissed', 'true');
  }

  completeStep(stepId: string): void {
    this.onboardingStepService.completeStep(stepId).subscribe({
      next: () => {
        const steps = this.onboardingSteps();
        const updatedSteps = steps.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        );
        this.onboardingSteps.set(updatedSteps);
        this.notificationService.success('Step Completed', 'Great progress!');
      },
      error: (error) => {
        console.error('Failed to complete step:', error);
        this.notificationService.error('Error', 'Failed to mark step as complete');
      }
    });
  }
}
