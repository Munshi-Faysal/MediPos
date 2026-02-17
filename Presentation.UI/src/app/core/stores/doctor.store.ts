import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signal, computed } from '@angular/core';
import { Doctor, DoctorFilters } from '../models/doctor.model';

export interface DoctorState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  filters: DoctorFilters;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorStore {
  // Initial state
  private initialState: DoctorState = {
    doctors: [],
    selectedDoctor: null,
    filters: {},
    loading: false,
    error: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<DoctorState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<DoctorState>(this.initialState);

  // Computed signals
  public doctors = computed(() => this.stateSignal().doctors);
  public selectedDoctor = computed(() => this.stateSignal().selectedDoctor);
  public filters = computed(() => this.stateSignal().filters);
  public loading = computed(() => this.stateSignal().loading);
  public error = computed(() => this.stateSignal().error);

  // Filtered doctors computed signal
  public filteredDoctors = computed(() => {
    const doctors = this.doctors();
    const filters = this.filters();

    let filtered = [...doctors];

    if (filters.name) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.licenseNumber) {
      filtered = filtered.filter(d =>
        d.licenseNumber.toLowerCase().includes(filters.licenseNumber!.toLowerCase())
      );
    }

    if (filters.specialization) {
      filtered = filtered.filter(d =>
        d.specialization?.toLowerCase().includes(filters.specialization!.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        d.licenseNumber.toLowerCase().includes(searchTerm) ||
        d.specialization?.toLowerCase().includes(searchTerm) ||
        d.email?.toLowerCase().includes(searchTerm) ||
        d.phone?.includes(searchTerm)
      );
    }

    return filtered;
  });

  // Doctors with expiring licenses (within 30 days)
  public doctorsWithExpiringLicenses = computed(() => {
    const doctors = this.doctors();
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return doctors.filter(doctor => {
      const expiry = new Date(doctor.licenseExpiryDate);
      return expiry >= today && expiry <= thirtyDaysFromNow;
    });
  });

  // Doctors with upcoming billing (within 7 days)
  public doctorsWithUpcomingBilling = computed(() => {
    const doctors = this.doctors();
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return doctors.filter(doctor => {
      const billing = new Date(doctor.billingDate);
      return billing >= today && billing <= sevenDaysFromNow;
    });
  });

  constructor() { }

  // State getters (RxJS)
  getState(): Observable<DoctorState> {
    return this.state$;
  }

  getDoctors(): Observable<Doctor[]> {
    return this.state$.pipe(
      map(state => state.doctors)
    );
  }

  getSelectedDoctor(): Observable<Doctor | null> {
    return this.state$.pipe(
      map(state => state.selectedDoctor)
    );
  }

  // State setters
  setDoctors(doctors: Doctor[]): void {
    this.updateState({ doctors });
  }

  addDoctor(doctor: Doctor): void {
    const current = this.stateSignal();
    this.updateState({
      doctors: [...current.doctors, doctor]
    });
  }

  updateDoctor(updatedDoctor: Doctor): void {
    const current = this.stateSignal();
    this.updateState({
      doctors: current.doctors.map(d =>
        d.id === updatedDoctor.id ? updatedDoctor : d
      ),
      selectedDoctor: current.selectedDoctor?.id === updatedDoctor.id
        ? updatedDoctor
        : current.selectedDoctor
    });
  }

  removeDoctor(id: string): void {
    const current = this.stateSignal();
    this.updateState({
      doctors: current.doctors.filter(d => d.id !== id),
      selectedDoctor: current.selectedDoctor?.id === id
        ? null
        : current.selectedDoctor
    });
  }

  setSelectedDoctor(doctor: Doctor | null): void {
    this.updateState({ selectedDoctor: doctor });
  }

  setFilters(filters: DoctorFilters): void {
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
  private updateState(partial: Partial<DoctorState>): void {
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
