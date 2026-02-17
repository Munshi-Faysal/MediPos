import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Medicine } from '../../../core/models/medicine.model';

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [],
  templateUrl: './medicine-card.component.html',
  styleUrls: ['./medicine-card.component.scss']
})
export class MedicineCardComponent {
  @Input() medicine!: Medicine;
  @Input() showActions = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() select = new EventEmitter<Medicine>();
  @Output() view = new EventEmitter<Medicine>();
  @Output() edit = new EventEmitter<Medicine>();

  onSelect(): void {
    this.select.emit(this.medicine);
  }

  onView(): void {
    this.view.emit(this.medicine);
  }

  onEdit(): void {
    this.edit.emit(this.medicine);
  }

  getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'p-3 text-sm';
      case 'lg':
        return 'p-6 text-lg';
      default:
        return 'p-4 text-base';
    }
  }
}
