import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';




/**
 * Form Field Configuration Interface
 */
export interface DynamicFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local' | 'switch';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  searchable: boolean,
  pattern?: string | RegExp;
  rows?: number; // For textarea
  options?: { value: any; label: string; disabled?: boolean }[]; // For select/radio
  valueKey?: string; // For select options object display
  labelKey?: string; // For select options object display
  gridCols?: number; // Grid column span (1-12)
  validation?: {
    required?: string;
    min?: string;
    max?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    email?: string;
    custom?: (control: AbstractControl) => ValidationErrors | null;
  };
  helpText?: string; // Help text below field
  section?: string; // Group fields into sections
  layout?: 'horizontal' | 'vertical'; // For radio buttons
  onText?: string;
  offText?: string;
}

/**
 * Form Section Configuration
 */
export interface DynamicFormSection {
  title?: string;
  description?: string;
  fields: string[]; // Field keys in this section
  gridCols?: number; // Default grid columns for section (1-12)
}

/**
 * Dynamic Form Modal Configuration
 */
export interface DynamicFormModalConfig {
  title: string;
  createTitle?: string;
  editTitle?: string;
  description?: string;
  createDescription?: string;
  editDescription?: string;
  fields: DynamicFormField[];
  sections?: DynamicFormSection[];
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  createSubmitLabel?: string;
  editSubmitLabel?: string;
  cancelLabel?: string;
  modalWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  closeOnOverlayClick?: boolean;
  api?: {
    endpoint: string;
  };
  payloadMapper?: (formValue: any, isEdit: boolean) => any;
}



@Component({
  selector: 'app-dynamic-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dynamic-form-modal.component.html',
  styleUrl: './dynamic-form-modal.component.scss'
})
export class DynamicFormModalComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  @Input() isVisible = false;
  @Input() config!: DynamicFormModalConfig;
  @Input() data: any = null; // Existing data for editing
  @Input() loading = signal(false);

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Record<string, any>>();

  public fieldSearchQuery = signal({} as Record<string, string>);
  public showDropdown = signal({} as Record<string, boolean>);
  public highlightedIndex = signal({} as Record<string, number>);


  public form!: FormGroup;
  public isEditing = computed(() => !!(this.data && this.data.id));
  public sections = computed(() => this.groupFieldsIntoSections());

  private _formFields = new Map<string, DynamicFormField>();

  constructor() {
    // Initialize empty form
    this.form = this.fb.group({});
    // Watch for config changes and reinitialize form
    effect(() => {
      if (this.config) {

        // Reinitialize when config changes
        this.initializeFormFields();
        if (this.isVisible || !this.form) {
          this.buildForm();
          if (this.isVisible && this.form) {
            if (this.data) {
              this.loadFormData();
            } else {
              this.resetForm();
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.config) {
      this.initializeFormFields();
      this.buildForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.initializeFormFields();
      this.buildForm();
      // Re-initialize when config changes
      if (this.isVisible && this.form) {
        if (this.data) {
          this.loadFormData();
        } else {
          this.resetForm();
        }
      }
    }
    
    // Check if isVisible or data changed
    const isVisibleChanged = changes['isVisible'];
    const dataChanged = changes['data'];
    
    if ((isVisibleChanged || dataChanged) && this.isVisible) {
      // Ensure form is initialized and built
      if (!this.form || !this.form.controls || Object.keys(this.form.controls).length === 0) {
        if (this.config) {
        this.initializeFormFields();
        this.buildForm();
        } else {
          // If no config yet, wait for it
          return;
        }
      }
      
      // Load data if available, otherwise reset
      // Use setTimeout to ensure all changes are processed in the same change detection cycle
      setTimeout(() => {
        if (this.isVisible && this.form) {
      if (this.data) {
        this.loadFormData();
      } else {
        this.resetForm();
      }
        }
      }, 0);
    }
  }

  private initializeFormFields(): void {
    this._formFields.clear();
    if (this.config?.fields) {
      this.config.fields.forEach(field => {
        this._formFields.set(field.key, field);
      });
    }
  }

  private buildForm(): void {
    const formControls: Record<string, any> = {};

    this._formFields.forEach((field, key) => {
      const validators: any[] = [];

      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }
      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }
      if (field.minLength !== undefined) {
        validators.push(Validators.minLength(field.minLength ?? null));
      }
      if (field.maxLength !== undefined) {
        validators.push(Validators.maxLength(field.maxLength ?? null));
      }
      if (field.pattern) {
        const pattern = typeof field.pattern === 'string' ? new RegExp(field.pattern) : field.pattern;
        validators.push(Validators.pattern(pattern));
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      if (field.validation?.custom) {
        validators.push(field.validation.custom);
      }

      let defaultValue = this.config?.defaultValues?.[key] ?? this.getDefaultValue(field);

      // For radio buttons, ensure default value is a string matching option values
      if (field.type === 'radio' && defaultValue !== null && defaultValue !== undefined) {
        defaultValue = String(defaultValue);
        console.log(`[BUILD FORM] Radio field ${key}: Set initial value to '${defaultValue}' (type: ${typeof defaultValue})`);
      }

      formControls[key] = [{ value: defaultValue, disabled: field.disabled || false }, validators];
    });

    this.form = this.fb.group(formControls);
  }

  private getDefaultValue(field: DynamicFormField): any {
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'number':
        return 0;
      default:
        return field.type === 'select' ? null : '';
    }
  }

  private resetForm(): void {
    if (!this.form) return;

    const resetValues: Record<string, any> = {};
    this._formFields.forEach((field, key) => {
      resetValues[key] = this.config?.defaultValues?.[key] ?? this.getDefaultValue(field);
    });

    this.form.reset(resetValues);
    Object.keys(this.form.controls).forEach(key => {
      const field = this._formFields.get(key);
      if (field?.disabled) {
        this.form.get(key)?.disable();
      }
    });
  }

  // private loadFormData(): void {
  //   if (!this.form || !this.data) return;

  //   const patchValues: Record<string, any> = {};
  //   this._formFields.forEach((field, key) => {
  //     const value = this.data[key] ?? this.config?.defaultValues?.[key] ?? this.getDefaultValue(field);
  //     patchValues[key] = value;
  //   });

  //   this.form.patchValue(patchValues);
  // }

  private loadFormData(): void {
    if (!this.form || !this.data) return;

    const patchValues: Record<string, any> = {};
    this._formFields.forEach((field, key) => {
      let value = this.data[key] ?? this.config?.defaultValues?.[key] ?? this.getDefaultValue(field);

      // Convert to string for radio buttons to ensure proper matching with option values
      if (field.type === 'radio' && value !== null && value !== undefined) {
        value = String(value);
        console.log(`[RADIO DEBUG] Field ${key}: Original=${this.data[key]}, Converted=${value}, Type=${typeof value}`);
      }

      patchValues[key] = value;
    });

    console.log('[FORM DEBUG] Patching values:', patchValues);
    this.form.patchValue(patchValues);
  }






  private groupFieldsIntoSections(): DynamicFormSection[] {
    if (!this.config) return [];

    // If sections are defined in config, use them directly
    if (this.config.sections && this.config.sections.length > 0) {
      return this.config.sections.map(sectionConfig => ({
        title: sectionConfig.title,
        description: sectionConfig.description,
        fields: sectionConfig.fields, // Use all fields from section config - they should all exist
        gridCols: sectionConfig.gridCols || 12
      }));
    }

    // Fallback: group fields by their section property
    const sectionsMap = new Map<string, DynamicFormSection>();

    this.config.fields.forEach(field => {
      const sectionKey = field.section || 'default';

      if (!sectionsMap.has(sectionKey)) {
        sectionsMap.set(sectionKey, {
          title: sectionKey !== 'default' ? sectionKey : undefined,
          description: undefined,
          fields: [],
          gridCols: 12
        });
      }

      sectionsMap.get(sectionKey)!.fields.push(field.key);
    });

    return Array.from(sectionsMap.values());
  }

  getFieldsForSection(sectionTitle?: string): DynamicFormField[] {
    debugger;
    if (!sectionTitle) {
      // Return fields without section
      return this.config.fields.filter(f => !f.section);
    }
    const section = this.sections().find(s => s.title === sectionTitle);
    if (!section) return [];
    return section.fields.map(key => this._formFields.get(key)!).filter(Boolean);
  }

  getFieldByKey(key: string): DynamicFormField | undefined {
    const field = this._formFields.get(key);
    if (!field) {
      console.warn(`Field '${key}' not found in _formFields map. Available keys:`, Array.from(this._formFields.keys()));
    }
    return field;
  }

  filteredOptions(fieldKey: string) {
    const query = this.fieldSearchQuery()[fieldKey]?.toLowerCase() || '';
    const field = this.getFieldByKey(fieldKey);
    if (!field?.options) return [];
    return field.options.filter(opt => opt.label.toLowerCase().includes(query));
  }

  selectFieldOption(fieldKey: string, option: any) {
    this.form.patchValue({ [fieldKey]: option.value });
    this.fieldSearchQuery.update(prev => ({ ...prev, [fieldKey]: option.label }));
    this.showDropdown.update(prev => ({ ...prev, [fieldKey]: false }));
    this.highlightedIndex.update(prev => ({ ...prev, [fieldKey]: -1 }));
  }
  getFieldDisplayValue(fieldKey: string) {
    const val = this.form.get(fieldKey)?.value;
    const field = this.getFieldByKey(fieldKey);
    if (!field) return '';
    const option = field.options?.find(o => o.value === val);
    return option ? option.label : this.fieldSearchQuery()[fieldKey] || '';
  }
  /**
   * Handle input search for searchable select fields
   */
  onFieldSearch(event: Event, fieldKey: string) {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    // Update search query for the field
    this.fieldSearchQuery.update(prev => ({ ...prev, [fieldKey]: query }));

    // Show dropdown always when focused, not only if query exists
    this.showDropdown.update(prev => ({ ...prev, [fieldKey]: true }));

    // Reset highlighted index
    this.highlightedIndex.update(prev => ({ ...prev, [fieldKey]: -1 }));
  }


  /**
   * Optional: handle field focus to show dropdown
   */
  onFieldFocus(fieldKey: string) {
    this.showDropdown.update(prev => ({ ...prev, [fieldKey]: true }));
  }

  /**
   * Optional: handle field blur to hide dropdown
   */
  onFieldBlur(fieldKey: string) {
    setTimeout(() => {
      this.showDropdown.update(prev => ({ ...prev, [fieldKey]: false }));
    }, 150); // slight delay to allow click selection
  }

  /**
   * Optional: handle arrow key navigation inside dropdown
   */
  onFieldKeyDown(event: KeyboardEvent, fieldKey: string) {
    const options = this.filteredOptions(fieldKey);
    if (!options.length) return;

    let index = this.highlightedIndex()[fieldKey] ?? -1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      index = (index + 1) % options.length;
      this.highlightedIndex.update(prev => ({ ...prev, [fieldKey]: index }));
      this.scrollToOption(fieldKey, index);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      index = (index - 1 + options.length) % options.length;
      this.highlightedIndex.update(prev => ({ ...prev, [fieldKey]: index }));
      this.scrollToOption(fieldKey, index);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (index >= 0) {
        this.selectFieldOption(fieldKey, options[index]);
      }
    }
  }

  // Scroll highlighted option into view
  scrollToOption(fieldKey: string, index: number) {
    setTimeout(() => {
      const container = document.getElementById(`dropdown-${fieldKey}`);
      const option = document.getElementById(`dropdown-${fieldKey}-option-${index}`);
      if (container && option) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const optionTop = option.offsetTop;
        const optionBottom = optionTop + option.offsetHeight;

        if (optionBottom > containerBottom) {
          container.scrollTop += optionBottom - containerBottom;
        } else if (optionTop < containerTop) {
          container.scrollTop -= containerTop - optionTop;
        }
      }
    }, 0);
  }




  // getFieldOptions(field: DynamicFormField): any[] {
  //   if (!field.options) return [];
  //   return field.options.map(opt => {
  //     // Handle null values
  //     if (opt.value === null || opt.value === undefined) {
  //       return {
  //         value: null,
  //         label: opt.label || '',
  //         disabled: opt.disabled || false
  //       };
  //     }

  //     // Handle object values
  //     if (typeof opt.value === 'object') {
  //       return {
  //         value: opt.value[field.valueKey || 'value'],
  //         label: opt.value[field.labelKey || 'label'] || opt.label,
  //         disabled: opt.disabled || false
  //       };
  //     }

  //     // Handle primitive values
  //     return {
  //       value: opt.value,
  //       label: opt.label || String(opt.value),
  //       disabled: opt.disabled || false
  //     };
  //   });
  // }


  getFieldOptions(field: DynamicFormField): any[] {
    if (!field.options) return [];
    const options = field.options.map(opt => {
      let value: any = opt.value;

      if (value === null || value === undefined) value = ''; // use empty string for null
      else if (typeof value !== 'string') value = String(value); // convert number/object to string

      return {
        value,
        label: opt.label || String(opt.value),
        disabled: opt.disabled || false
      };
    });

    if (field.type === 'radio') {
      console.log(`[RADIO DEBUG] Field ${field.key} options:`, options, 'Current value:', this.form?.get(field.key)?.value);
    }

    return options;
  }



  getModalTitle(): string {
    if (this.isEditing() && this.config?.editTitle) {
      return this.config.editTitle;
    }
    if (!this.isEditing() && this.config?.createTitle) {
      return this.config.createTitle;
    }
    return this.config?.title || 'Form';
  }

  getModalDescription(): string {
    if (this.isEditing() && this.config?.editDescription) {
      return this.config.editDescription;
    }
    if (!this.isEditing() && this.config?.createDescription) {
      return this.config.createDescription;
    }
    return this.config?.description || '';
  }

  getSubmitLabel(): string {
    if (this.isEditing() && this.config?.editSubmitLabel) {
      return this.config.editSubmitLabel;
    }
    if (!this.isEditing() && this.config?.createSubmitLabel) {
      return this.config.createSubmitLabel;
    }
    return this.config?.submitLabel || (this.isEditing() ? 'Update' : 'Create');
  }

  getCancelLabel(): string {
    return this.config?.cancelLabel || 'Cancel';
  }

  getModalWidthClass(): string {
    const widthMap: Record<string, string> = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      'full': 'max-w-full'
    };
    return widthMap[this.config?.modalWidth || '4xl'] || 'max-w-4xl';
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onBackdropClick(): void {
    if (this.config?.closeOnOverlayClick !== false) {
      this.onClose();
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const rawValue = this.form.getRawValue();
    const payload = this.config.payloadMapper
      ? this.config.payloadMapper(rawValue, this.isEditing())
      : rawValue;

    if (this.config.api) {
      this.loading.set(true);
      const endpoint = this.config.api.endpoint;
      let request$: Observable<any>;

      if (this.isEditing() && this.data?.id) {
        // Update
        const url = `${endpoint}/${this.data.id}`;
        request$ = this.apiService.put(url, payload);
      } else {
        // Create
        request$ = this.apiService.post(endpoint, payload);
      }

      request$.subscribe({
        next: (res) => {
          this.loading.set(false);
          this.notificationService.success('Success', 'Operation completed successfully');
          this.save.emit(res);
          this.onClose();
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.message || 'Operation failed';
          this.notificationService.error('Error', msg);
        }
      });
    } else {
      this.save.emit(payload);
    }
  }

  isFieldInvalid(fieldKey: string): boolean {
    const field = this.form.get(fieldKey);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldKey: string): string {
    const field = this.form.get(fieldKey);
    const fieldConfig = this._formFields.get(fieldKey);

    if (!field || !field.errors || !fieldConfig) return '';

    const validation = fieldConfig.validation || {};

    if (field.errors['required']) {
      return validation.required || `${fieldConfig.label} is required`;
    }
    if (field.errors['minlength']) {
      return validation.minLength || `${fieldConfig.label} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['maxlength']) {
      return validation.maxLength || `${fieldConfig.label} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return validation.min || `${fieldConfig.label} must be at least ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return validation.max || `${fieldConfig.label} must not exceed ${field.errors['max'].max}`;
    }
    if (field.errors['pattern']) {
      return validation.pattern || `${fieldConfig.label} format is invalid`;
    }
    if (field.errors['email']) {
      return validation.email || `${fieldConfig.label} must be a valid email`;
    }

    return validation.pattern || 'Invalid value';
  }

  getGridColsClass(field: DynamicFormField, defaultCols = 12): string {
    const cols = field.gridCols || defaultCols;
    const colMap: Record<number, string> = {
      1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
      5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
      9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12'
    };
    return colMap[cols] || 'md:col-span-12';
  }


}

