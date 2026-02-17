import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signal, computed } from '@angular/core';
import { Patient, PatientFilters } from '../models/patient.model';

export interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  filters: PatientFilters;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PatientStore {
  // Initial state
  private initialState: PatientState = {
    patients: [],
    selectedPatient: null,
    filters: {},
    loading: false,
    error: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<PatientState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<PatientState>(this.initialState);

  // Computed signals
  public patients = computed(() => this.stateSignal().patients);
  public selectedPatient = computed(() => this.stateSignal().selectedPatient);
  public filters = computed(() => this.stateSignal().filters);
  public loading = computed(() => this.stateSignal().loading);
  public error = computed(() => this.stateSignal().error);

  // Filtered patients computed signal
  public filteredPatients = computed(() => {
    const patients = this.patients();
    const filters = this.filters();

    let filtered = [...patients];

    if (filters.name) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.phone) {
      filtered = filtered.filter(p =>
        p.phone.includes(filters.phone!)
      );
    }

    if (filters.email) {
      filtered = filtered.filter(p =>
        p.email?.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.phone.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  constructor() { }

  // State getters (RxJS)
  getState(): Observable<PatientState> {
    return this.state$;
  }

  getPatients(): Observable<Patient[]> {
    return this.state$.pipe(
      map(state => state.patients)
    );
  }

  getSelectedPatient(): Observable<Patient | null> {
    return this.state$.pipe(
      map(state => state.selectedPatient)
    );
  }

  // State setters
  setPatients(patients: Patient[]): void {
    this.updateState({ patients });
  }

  addPatient(patient: Patient): void {
    const current = this.stateSignal();
    this.updateState({
      patients: [...current.patients, patient]
    });
  }

  updatePatient(updatedPatient: Patient): void {
    const current = this.stateSignal();
    this.updateState({
      patients: current.patients.map(p =>
        p.id === updatedPatient.id ? updatedPatient : p
      ),
      selectedPatient: current.selectedPatient?.id === updatedPatient.id
        ? updatedPatient
        : current.selectedPatient
    });
  }

  removePatient(id: string): void {
    const current = this.stateSignal();
    this.updateState({
      patients: current.patients.filter(p => p.id !== id),
      selectedPatient: current.selectedPatient?.id === id
        ? null
        : current.selectedPatient
    });
  }

  setSelectedPatient(patient: Patient | null): void {
    this.updateState({ selectedPatient: patient });
  }

  setFilters(filters: PatientFilters): void {
    this.updateState({ filters });
  }

  clearFilters(): void {
    this.updateState({ filters: {} });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  // Helper method to update state
  private updateState(partial: Partial<PatientState>): void {
    const current = this.stateSignal();
    const newState = { ...current, ...partial };
    this.stateSignal.set(newState);
    this.stateSubject.next(newState);
  }

  // Reset state
  reset(): void {
    this.stateSignal.set(this.initialState);
  }
}
