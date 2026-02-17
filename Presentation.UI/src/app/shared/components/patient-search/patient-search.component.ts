import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.scss']
})
export class PatientSearchComponent {
  private patientService = inject(PatientService);

  @Input() placeholder = 'Search patient by name, phone, or email...';
  @Input() showResults = true;
  @Input() maxResults = 10;
  @Output() patientSelected = new EventEmitter<Patient>();
  @Output() searchChange = new EventEmitter<string>();

  searchQuery = signal<string>('');
  patients = signal<Patient[]>([]);
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
        return this.patientService.searchPatients(query);
      })
    ).subscribe({
      next: (patients) => {
        this.patients.set(patients.slice(0, this.maxResults));
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

  selectPatient(patient: Patient): void {
    this.patientSelected.emit(patient);
    this.searchQuery.set(patient.name);
    this.showDropdown.set(false);
  }

  onFocus(): void {
    if (this.patients().length > 0) {
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
    this.patients.set([]);
    this.showDropdown.set(false);
    this.searchChange.emit('');
  }
}
