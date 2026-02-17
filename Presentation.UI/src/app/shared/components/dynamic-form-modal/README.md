# Dynamic Form Modal Component

A reusable, configurable form modal component that can be used across different modules.

## Features

- **Fully Configurable**: Define form fields through configuration objects
- **Multiple Field Types**: Supports text, email, password, number, textarea, select, checkbox, radio, date, time, etc.
- **Section Support**: Group fields into logical sections
- **Grid Layout**: Flexible grid column layout for responsive forms
- **Validation**: Built-in validation with custom error messages
- **Edit/Create Modes**: Automatically handles create and edit modes
- **Responsive**: Mobile-friendly design

## Usage

### Basic Example

```typescript
import { DynamicFormModalComponent, DynamicFormModalConfig } from '@shared/components/dynamic-form-modal/dynamic-form-modal.component';

@Component({
  selector: 'app-my-component',
  template: `
    <app-dynamic-form-modal
      [isVisible]="showModal()"
      [config]="formConfig"
      [data]="selectedItem"
      [loading]="isLoading"
      (close)="onClose()"
      (save)="onSave($event)"
    ></app-dynamic-form-modal>
  `
})
export class MyComponent {
  showModal = signal(false);
  selectedItem: any = null;
  isLoading = signal(false);

  formConfig: DynamicFormModalConfig = {
    title: 'User Form',
    createTitle: 'Create User',
    editTitle: 'Edit User',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        minLength: 2,
        gridCols: 6
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        gridCols: 6
      }
    ]
  };

  onSave(data: Record<string, any>): void {
    // Handle save
  }
}
```

## Configuration Options

### DynamicFormModalConfig

```typescript
interface DynamicFormModalConfig {
  title: string;                    // Default title
  createTitle?: string;             // Title for create mode
  editTitle?: string;               // Title for edit mode
  description?: string;             // Default description
  createDescription?: string;       // Description for create mode
  editDescription?: string;         // Description for edit mode
  fields: DynamicFormField[];       // Array of form fields
  sections?: DynamicFormSection[];  // Optional sections
  defaultValues?: Record<string, any>; // Default form values
  submitLabel?: string;             // Default submit button label
  createSubmitLabel?: string;       // Submit label for create mode
  editSubmitLabel?: string;         // Submit label for edit mode
  cancelLabel?: string;             // Cancel button label
  modalWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'; // Modal width
}
```

### DynamicFormField

```typescript
interface DynamicFormField {
  key: string;                      // Field key (form control name)
  label: string;                    // Field label
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time';
  placeholder?: string;             // Placeholder text
  required?: boolean;               // Is required
  disabled?: boolean;               // Is disabled
  readonly?: boolean;               // Is readonly
  hidden?: boolean;                 // Is hidden
  min?: number;                     // Minimum value (for numbers/dates)
  max?: number;                     // Maximum value (for numbers/dates)
  minLength?: number;               // Minimum length
  maxLength?: number;               // Maximum length
  pattern?: string | RegExp;        // Validation pattern
  rows?: number;                    // Rows for textarea
  options?: Array<{ value: any; label: string; disabled?: boolean }>; // Options for select/radio
  gridCols?: number;                // Grid column span (1-12)
  section?: string;                 // Section name to group fields
  validation?: {                    // Custom validation messages
    required?: string;
    min?: string;
    max?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    email?: string;
    custom?: (control: AbstractControl) => ValidationErrors | null;
  };
  helpText?: string;                // Help text below field
}
```

## Examples

### Menu Form Configuration

See `menu-form-config.ts` for a complete example of configuring a menu form with multiple field types and sections.

### Simple User Form

```typescript
const userFormConfig: DynamicFormModalConfig = {
  title: 'User',
  fields: [
    {
      key: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      minLength: 2,
      gridCols: 6
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      gridCols: 6
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      gridCols: 6,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    },
    {
      key: 'active',
      label: 'Active',
      type: 'checkbox',
      gridCols: 6
    }
  ]
};
```

## Benefits

- **Reusable**: Use the same component across different modules
- **Maintainable**: Single source of truth for form UI
- **Flexible**: Highly configurable to fit any form requirement
- **Type-Safe**: Full TypeScript support
- **Consistent**: Ensures consistent form UI across the application

