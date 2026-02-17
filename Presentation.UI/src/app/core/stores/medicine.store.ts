import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Medicine, MedicineFilters } from '../models/medicine.model';

export interface MedicineState {
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  filters: MedicineFilters;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineStore {
  // Initial state
  private initialState: MedicineState = {
    medicines: [],
    selectedMedicine: null,
    filters: {},
    loading: false,
    error: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<MedicineState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<MedicineState>(this.initialState);

  // Computed signals
  public medicines = computed(() => this.stateSignal().medicines);
  public selectedMedicine = computed(() => this.stateSignal().selectedMedicine);
  public filters = computed(() => this.stateSignal().filters);
  public loading = computed(() => this.stateSignal().loading);
  public error = computed(() => this.stateSignal().error);

  // Filtered medicines computed signal
  public filteredMedicines = computed(() => {
    const medicines = this.medicines();
    const filters = this.filters();

    let filtered = [...medicines];

    if (filters.genericName) {
      filtered = filtered.filter(m =>
        m.genericName.toLowerCase().includes(filters.genericName!.toLowerCase())
      );
    }

    if (filters.companyName) {
      filtered = filtered.filter(m =>
        m.companyName.toLowerCase().includes(filters.companyName!.toLowerCase())
      );
    }

    if (filters.medicineName) {
      filtered = filtered.filter(m =>
        m.medicineName.toLowerCase().includes(filters.medicineName!.toLowerCase())
      );
    }

    if (filters.form) {
      filtered = filtered.filter(m => m.form === filters.form);
    }

    if (filters.category) {
      filtered = filtered.filter(m =>
        m.category?.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.genericName.toLowerCase().includes(searchTerm) ||
        m.companyName.toLowerCase().includes(searchTerm) ||
        m.medicineName.toLowerCase().includes(searchTerm) ||
        m.variation.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  constructor() { }

  // State getters (RxJS)
  getState(): Observable<MedicineState> {
    return this.state$;
  }

  getMedicines(): Observable<Medicine[]> {
    return this.state$.pipe(
      map(state => state.medicines)
    );
  }

  getSelectedMedicine(): Observable<Medicine | null> {
    return this.state$.pipe(
      map(state => state.selectedMedicine)
    );
  }

  // State setters
  setMedicines(medicines: Medicine[]): void {
    this.updateState({ medicines });
  }

  addMedicine(medicine: Medicine): void {
    const current = this.stateSignal();
    this.updateState({
      medicines: [...current.medicines, medicine]
    });
  }

  updateMedicine(updatedMedicine: Medicine): void {
    const current = this.stateSignal();
    this.updateState({
      medicines: current.medicines.map(m =>
        m.id === updatedMedicine.id ? updatedMedicine : m
      ),
      selectedMedicine: current.selectedMedicine?.id === updatedMedicine.id
        ? updatedMedicine
        : current.selectedMedicine
    });
  }

  removeMedicine(id: string): void {
    const current = this.stateSignal();
    this.updateState({
      medicines: current.medicines.filter(m => m.id !== id),
      selectedMedicine: current.selectedMedicine?.id === id
        ? null
        : current.selectedMedicine
    });
  }

  setSelectedMedicine(medicine: Medicine | null): void {
    this.updateState({ selectedMedicine: medicine });
  }

  setFilters(filters: MedicineFilters): void {
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
  private updateState(partial: Partial<MedicineState>): void {
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
