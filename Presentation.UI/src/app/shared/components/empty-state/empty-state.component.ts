import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';


export interface EmptyStateConfig {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: string;
  showAction?: boolean;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
      <!-- Icon -->
      @if (config.icon) {
        <div
          class="w-16 h-16 mx-auto mb-4 text-on-surface-variant"
          >
          <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="config.icon"></path>
          </svg>
        </div>
      }
    
      <!-- Default Icon if none provided -->
      @if (!config.icon) {
        <div
          class="w-16 h-16 mx-auto mb-4 bg-surface-variant rounded-full flex items-center justify-center"
          >
          <svg class="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
      }
    
      <!-- Title -->
      <h3 class="text-lg font-semibold text-on-surface mb-2">
        {{ config.title }}
      </h3>
    
      <!-- Description -->
      <p class="text-on-surface-variant mb-6 max-w-md">
        {{ config.description }}
      </p>
    
      <!-- Action Button -->
      @if (config.showAction && config.actionText) {
        <button
          (click)="onAction()"
          class="btn-primary"
          >
          @if (config.actionIcon) {
            <svg
              class="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="config.actionIcon"></path>
            </svg>
          }
          {{ config.actionText }}
        </button>
      }
    </div>
    `,
  styles: []
})
export class EmptyStateComponent {
  @Input() config: EmptyStateConfig = {
    title: 'No data available',
    description: 'There are no items to display at this time.',
    showAction: false
  };

  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
