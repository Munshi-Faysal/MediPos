import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() showLabel = true;
  @Output() dateChange = new EventEmitter<Date | null>();

  value = '';
  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  writeValue(value: Date | string | null): void {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value;
      this.value = this.formatDateForInput(date);
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;
    this.value = dateValue;
    
    if (dateValue) {
      const date = new Date(dateValue);
      this.onChange(date);
      this.dateChange.emit(date);
    } else {
      this.onChange(null);
      this.dateChange.emit(null);
    }
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
