import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface OnboardingStepDto {
  encryptedId?: string;
  stepKey: string;
  title: string;
  description?: string;
  route?: string;
  icon?: string;
  displayOrder: number;
  isRequired: boolean;
  completed: boolean;
  isActive?: boolean;
}

export interface OnboardingStatusDto {
  steps: OnboardingStepDto[];
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface CompleteStepDto {
  stepKey: string;
}

/**
 * Onboarding Step Service for managing user onboarding progress
 */
@Injectable({
  providedIn: 'root'
})
export class OnboardingStepService {
  private api = inject(ApiService);

  private readonly endpoint = '/OnboardingStep';

  /**
   * Get the current user's onboarding status with all steps
   */
  getOnboardingStatus(): Observable<OnboardingStatusDto> {
    return this.api.get<OnboardingStatusDto>(`${this.endpoint}/status`);
  }

  /**
   * Get all available onboarding steps
   */
  getAllSteps(): Observable<OnboardingStepDto[]> {
    return this.api.get<OnboardingStepDto[]>(`${this.endpoint}/steps`);
  }

  /**
   * Mark a step as completed
   */
  completeStep(stepKey: string): Observable<{ message: string }> {
    const dto: CompleteStepDto = { stepKey };
    return this.api.post<{ message: string }>(`${this.endpoint}/complete`, dto);
  }

  /**
   * Reset all onboarding progress for the current user
   */
  resetProgress(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`${this.endpoint}/reset`, {});
  }
}
