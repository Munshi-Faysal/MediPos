import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Medicine } from '../../../core/models/medicine.model';
import { MedicineService } from '../../../core/services/medicine.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-medicine-autocomplete',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './medicine-autocomplete.component.html',
  styleUrls: ['./medicine-autocomplete.component.scss']
})
export class MedicineAutocompleteComponent {
  private medicineService = inject(MedicineService);

  @Input() placeholder = 'Search medicine...';
  @Input() showResults = true;
  @Input() maxResults = 10;
  @Output() medicineSelected = new EventEmitter<Medicine>();
  @Output() searchChange = new EventEmitter<string>();

  searchQuery = signal<string>('');
  medicines = signal<Medicine[]>([]);
  loading = signal<boolean>(false);
  showDropdown = signal<boolean>(false);
  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') {
          return of([]);
        }
        this.loading.set(true);
        return this.medicineService.searchMedicines(query);
      })
    ).subscribe({
      next: (medicines) => {
        this.medicines.set(medicines.slice(0, this.maxResults));
        this.loading.set(false);
        this.showDropdown.set(true);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onInput(value: string): void {
    this.searchQuery.set(value);
    this.searchChange.emit(value);
    this.searchSubject.next(value);
  }

  selectMedicine(medicine: Medicine): void {
    this.medicineSelected.emit(medicine);
    this.searchQuery.set(medicine.medicineName);
    this.showDropdown.set(false);
  }

  onFocus(): void {
    if (this.medicines().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onBlur(): void {
    // Delay to allow click event to fire
    setTimeout(() => {
      this.showDropdown.set(false);
    }, 200);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.medicines.set([]);
    this.showDropdown.set(false);
    this.searchChange.emit('');
  }
}
