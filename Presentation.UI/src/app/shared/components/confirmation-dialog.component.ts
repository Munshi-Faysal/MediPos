import { Component, Input, Output, EventEmitter, signal } from '@angular/core';


@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (isVisible) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-surface border border-border rounded-lg shadow-strong max-w-md w-full mx-4">
          <!-- Header -->
          <div class="p-6 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                [class.bg-success-100]="isSuccessDialog"
                [class.bg-warning-100]="!isSuccessDialog"
                [class.dark:bg-success-900]="isSuccessDialog"
                [class.dark:bg-warning-900]="!isSuccessDialog">
                @if (isSuccessDialog) {
                  <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                @if (!isSuccessDialog) {
                  <svg class="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                }
              </div>
              <div>
                <h3 class="text-lg font-semibold text-on-surface">{{ title }}</h3>
                <p class="text-sm text-on-surface-variant">{{ message }}</p>
              </div>
            </div>
          </div>
          <!-- Content -->
          @if (details) {
            <div class="p-6">
              <div class="p-3 bg-surface-variant rounded-md">
                <p class="text-sm text-on-surface-variant">{{ details }}</p>
              </div>
            </div>
          }
          <!-- Actions -->
          <div class="p-6 border-t border-border flex justify-end gap-3">
            <button
              (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-md transition-colors"
              >
              {{ cancelText }}
            </button>
            <button
              (click)="onConfirm()"
              class="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2"
              [class.bg-success-600]="isSuccessDialog"
              [class.hover:bg-success-700]="isSuccessDialog"
              [class.bg-error-600]="!isSuccessDialog"
              [class.hover:bg-error-700]="!isSuccessDialog"
              >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
    `,
  styles: []
})
export class ConfirmationDialogComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() details = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isSuccessDialog = false;

  @Output() confirmed = new EventEmitter<boolean>();

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.confirmed.emit(false);
  }

  show(title: string, message: string, details?: string): void {
    this.title = title;
    this.message = message;
    this.details = details || '';
  }
}
