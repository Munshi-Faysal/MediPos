// import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// export interface FormFieldConfig {
//   key: string;
//   label: string;
//   type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local';
//   placeholder?: string;
//   required?: boolean;
//   disabled?: boolean;
//   readonly?: boolean;
//   hidden?: boolean;
//   min?: number;
//   max?: number;
//   minLength?: number;
//   maxLength?: number;
//   pattern?: string;
//   options?: { value: any; label: string }[];
//   validation?: {
//     required?: string;
//     min?: string;
//     max?: string;
//     minLength?: string;
//     maxLength?: string;
//     pattern?: string;
//     email?: string;
//   };
// }

// @Component({
//   selector: 'app-dynamic-form',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <form (ngSubmit)="onSubmit()" class="space-y-6">
//       <div
//         *ngFor="let field of fields"
//         class="space-y-2"
//         [class.hidden]="field.hidden"
//       >
//         <!-- Label -->
//         <label
//           *ngIf="field.type !== 'checkbox'"
//           [for]="field.key"
//           class="form-label"
//           [class.required]="field.required"
//         >
//           {{ field.label }}
//           <span *ngIf="field.required" class="text-error-600 ml-1">*</span>
//         </label>

//         <!-- Text Input -->
//         <input
//           *ngIf="['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'datetime-local'].includes(field.type)"
//           [id]="field.key"
//           [name]="field.key"
//           [type]="field.type"
//           [(ngModel)]="formData[field.key]"
//           [placeholder]="field.placeholder"
//           [required]="field.required || false"
//           [disabled]="field.disabled || false"
//           [readonly]="field.readonly || false"
//           [min]="field.min || null"
//           [max]="field.max || null"
//           [minlength]="field.minLength || null"
//           [maxlength]="field.maxLength || null"
//           [pattern]="field.pattern || ''"
//           class="form-input"
//           [class.error]="hasError(field.key)"
//         />

//         <!-- Textarea -->
//         <textarea
//           *ngIf="field.type === 'textarea'"
//           [id]="field.key"
//           [name]="field.key"
//           [(ngModel)]="formData[field.key]"
//           [placeholder]="field.placeholder"
//           [required]="field.required || false"
//           [disabled]="field.disabled || false"
//           [readonly]="field.readonly || false"
//           [minlength]="field.minLength || null"
//           [maxlength]="field.maxLength || null"
//           rows="4"
//           class="form-input resize-none"
//           [class.error]="hasError(field.key)"
//         ></textarea>

//         <!-- Select -->
//         <select
//           *ngIf="field.type === 'select'"
//           [id]="field.key"
//           [name]="field.key"
//           [(ngModel)]="formData[field.key]"
//           [required]="field.required || false"
//           [disabled]="field.disabled || false"
//           class="form-input"
//           [class.error]="hasError(field.key)"
//         >
//           <option value="" disabled>{{ field.placeholder || 'Select an option' }}</option>
//           <option
//             *ngFor="let option of field.options"
//             [value]="option.value"
//           >
//             {{ option.label }}
//           </option>
//         </select>

//         <!-- Checkbox -->
//         <div *ngIf="field.type === 'checkbox'" class="flex items-center gap-3">
//           <input
//             [id]="field.key"
//             [name]="field.key"
//             type="checkbox"
//             [(ngModel)]="formData[field.key]"
//             [required]="field.required || false"
//             [disabled]="field.disabled || false"
//             class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
//           />
//           <label [for]="field.key" class="form-label">
//             {{ field.label }}
//             <span *ngIf="field.required" class="text-error-600 ml-1">*</span>
//           </label>
//         </div>

//         <!-- Radio Group -->
//         <div *ngIf="field.type === 'radio'" class="space-y-2">
//           <label class="form-label">
//             {{ field.label }}
//             <span *ngIf="field.required" class="text-error-600 ml-1">*</span>
//           </label>
//           <div class="space-y-2">
//             <div
//               *ngFor="let option of field.options"
//               class="flex items-center gap-3"
//             >
//               <input
//                 [id]="field.key + '_' + option.value"
//                 [name]="field.key"
//                 type="radio"
//                 [value]="option.value"
//                 [(ngModel)]="formData[field.key]"
//                 [required]="field.required || false"
//                 [disabled]="field.disabled || false"
//                 class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border"
//               />
//               <label [for]="field.key + '_' + option.value" class="text-sm text-on-surface">
//                 {{ option.label }}
//               </label>
//             </div>
//           </div>
//         </div>

//         <!-- Error Message -->
//         <div *ngIf="hasError(field.key)" class="form-error">
//           {{ getErrorMessage(field.key) }}
//         </div>
//       </div>

//       <!-- Form Actions -->
//       <div class="flex items-center justify-end gap-3 pt-6 border-t border-border">
//         <button
//           type="button"
//           (click)="onCancel()"
//           class="btn-outline"
//           [disabled]="loading()"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           class="btn-primary"
//           [disabled]="loading() || !isValid()"
//         >
//           <span *ngIf="loading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
//           {{ submitText }}
//         </button>
//       </div>
//     </form>
//   `,
//   styles: [`
//     .form-input.error {
//       @apply border-error-500 focus:border-error-500 focus:ring-error-500;
//     }
//   `]
// })
// export class DynamicFormComponent {
//   @Input() fields: FormFieldConfig[] = [];
//   @Input() formData: Record<string, any> = {};
//   @Input() loading = signal(false);
//   @Input() submitText = 'Submit';
//   @Input() showCancel = true;

//   @Output() submit = new EventEmitter<Record<string, any>>();
//   @Output() cancel = new EventEmitter<void>();
//   @Output() valueChange = new EventEmitter<Record<string, any>>();

//   public errors = signal<Record<string, string>>({});

//   isValid(): boolean {
//     return Object.keys(this.errors()).length === 0 && this.validateForm();
//   }

//   hasError(fieldKey: string): boolean {
//     return !!this.errors()[fieldKey];
//   }

//   getErrorMessage(fieldKey: string): string {
//     return this.errors()[fieldKey] || '';
//   }

//   onSubmit(): void {
//     if (this.validateForm()) {
//       this.submit.emit(this.formData);
//     }
//   }

//   onCancel(): void {
//     this.cancel.emit();
//   }

//   private validateForm(): boolean {
//     const newErrors: Record<string, string> = {};

//     this.fields.forEach(field => {
//       const value = this.formData[field.key];
      
//       // Required validation
//       if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
//         newErrors[field.key] = field.validation?.required || `${field.label} is required`;
//         return;
//       }

//       // Skip other validations if field is empty and not required
//       if (!value) return;

//       // Min length validation
//       if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
//         newErrors[field.key] = field.validation?.minLength || `${field.label} must be at least ${field.minLength} characters`;
//         return;
//       }

//       // Max length validation
//       if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
//         newErrors[field.key] = field.validation?.maxLength || `${field.label} must be no more than ${field.maxLength} characters`;
//         return;
//       }

//       // Min value validation
//       if (field.min !== undefined && typeof value === 'number' && value < field.min) {
//         newErrors[field.key] = field.validation?.min || `${field.label} must be at least ${field.min}`;
//         return;
//       }

//       // Max value validation
//       if (field.max !== undefined && typeof value === 'number' && value > field.max) {
//         newErrors[field.key] = field.validation?.max || `${field.label} must be no more than ${field.max}`;
//         return;
//       }

//       // Pattern validation
//       if (field.pattern && typeof value === 'string') {
//         const regex = new RegExp(field.pattern);
//         if (!regex.test(value)) {
//           newErrors[field.key] = field.validation?.pattern || `${field.label} format is invalid`;
//           return;
//         }
//       }

//       // Email validation
//       if (field.type === 'email' && typeof value === 'string') {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(value)) {
//           newErrors[field.key] = field.validation?.email || 'Please enter a valid email address';
//           return;
//         }
//       }
//     });

//     this.errors.set(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }
// }
