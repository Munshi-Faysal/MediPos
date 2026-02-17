import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signal, computed } from '@angular/core';
import { Prescription, PrescriptionFilters, PrescriptionStatus } from '../models/prescription.model';

export interface PrescriptionState {
  prescriptions: Prescription[];
  selectedPrescription: Prescription | null;
  filters: PrescriptionFilters;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionStore {
  // Initial state
  private initialState: PrescriptionState = {
    prescriptions: [],
    selectedPrescription: null,
    filters: {},
    loading: false,
    error: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<PrescriptionState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<PrescriptionState>(this.initialState);

  // Computed signals
  public prescriptions = computed(() => this.stateSignal().prescriptions);
  public selectedPrescription = computed(() => this.stateSignal().selectedPrescription);
  public filters = computed(() => this.stateSignal().filters);
  public loading = computed(() => this.stateSignal().loading);
  public error = computed(() => this.stateSignal().error);

  // Filtered prescriptions computed signal
  public filteredPrescriptions = computed(() => {
    const prescriptions = this.prescriptions();
    const filters = this.filters();

    let filtered = [...prescriptions];

    if (filters.doctorId) {
      filtered = filtered.filter(p => p.doctorId === filters.doctorId);
    }

    if (filters.patientId) {
      filtered = filtered.filter(p => p.patientId === filters.patientId);
    }

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(p => {
        const prescriptionDate = new Date(p.prescriptionDate);
        return prescriptionDate >= filters.startDate!;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(p => {
        const prescriptionDate = new Date(p.prescriptionDate);
        return prescriptionDate <= filters.endDate!;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.diagnosis?.toLowerCase().includes(searchTerm) ||
        p.notes?.toLowerCase().includes(searchTerm) ||
        p.id.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  // Prescriptions by status
  public prescriptionsByStatus = computed(() => {
    const prescriptions = this.prescriptions();
    return {
      draft: prescriptions.filter(p => p.status === PrescriptionStatus.DRAFT),
      completed: prescriptions.filter(p => p.status === PrescriptionStatus.COMPLETED),
      cancelled: prescriptions.filter(p => p.status === PrescriptionStatus.CANCELLED)
    };
  });

  // Recent prescriptions (last 30 days)
  public recentPrescriptions = computed(() => {
    const prescriptions = this.prescriptions();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prescriptions.filter(p => {
      const prescriptionDate = new Date(p.prescriptionDate);
      return prescriptionDate >= thirtyDaysAgo;
    });
  });

  constructor() { }

  // State getters (RxJS)
  getState(): Observable<PrescriptionState> {
    return this.state$;
  }

  getPrescriptions(): Observable<Prescription[]> {
    return this.state$.pipe(
      map(state => state.prescriptions)
    );
  }

  getSelectedPrescription(): Observable<Prescription | null> {
    return this.state$.pipe(
      map(state => state.selectedPrescription)
    );
  }

  // State setters
  setPrescriptions(prescriptions: Prescription[]): void {
    this.updateState({ prescriptions });
  }

  addPrescription(prescription: Prescription): void {
    const current = this.stateSignal();
    this.updateState({
      prescriptions: [...current.prescriptions, prescription]
    });
  }

  updatePrescription(updatedPrescription: Prescription): void {
    const current = this.stateSignal();
    this.updateState({
      prescriptions: current.prescriptions.map(p =>
        p.id === updatedPrescription.id ? updatedPrescription : p
      ),
      selectedPrescription: current.selectedPrescription?.id === updatedPrescription.id
        ? updatedPrescription
        : current.selectedPrescription
    });
  }

  removePrescription(id: string): void {
    const current = this.stateSignal();
    this.updateState({
      prescriptions: current.prescriptions.filter(p => p.id !== id),
      selectedPrescription: current.selectedPrescription?.id === id
        ? null
        : current.selectedPrescription
    });
  }

  setSelectedPrescription(prescription: Prescription | null): void {
    this.updateState({ selectedPrescription: prescription });
  }

  setFilters(filters: PrescriptionFilters): void {
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
  private updateState(partial: Partial<PrescriptionState>): void {
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
