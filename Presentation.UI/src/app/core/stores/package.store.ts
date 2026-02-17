import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signal, computed } from '@angular/core';
import { Package, PackageFilters, PackageStatus } from '../models/package.model';

export interface PackageState {
  packages: Package[];
  selectedPackage: Package | null;
  currentPackage: Package | null; // Currently active package for the user/organization
  filters: PackageFilters;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PackageStore {
  // Initial state
  private initialState: PackageState = {
    packages: [],
    selectedPackage: null,
    currentPackage: null,
    filters: {},
    loading: false,
    error: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<PackageState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<PackageState>(this.initialState);

  // Computed signals
  public packages = computed(() => this.stateSignal().packages);
  public selectedPackage = computed(() => this.stateSignal().selectedPackage);
  public currentPackage = computed(() => this.stateSignal().currentPackage);
  public filters = computed(() => this.stateSignal().filters);
  public loading = computed(() => this.stateSignal().loading);
  public error = computed(() => this.stateSignal().error);

  // Filtered packages computed signal
  public filteredPackages = computed(() => {
    const packages = this.packages();
    const filters = this.filters();

    let filtered = [...packages];

    if (filters.packageName) {
      filtered = filtered.filter(p =>
        p.packageName.toLowerCase().includes(filters.packageName!.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.userLimit) {
      filtered = filtered.filter(p => p.userLimit === filters.userLimit);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.packageName.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  // Active packages only
  public activePackages = computed(() => {
    return this.packages().filter(p => p.status === PackageStatus.ACTIVE);
  });

  // Packages by user limit
  public packagesByUserLimit = computed(() => {
    const packages = this.packages();
    return {
      single: packages.filter(p => p.userLimit === 1),
      small: packages.filter(p => p.userLimit === 5),
      medium: packages.filter(p => p.userLimit === 15),
      unlimited: packages.filter(p => p.userLimit === -1)
    };
  });

  constructor() { }

  // State getters (RxJS)
  getState(): Observable<PackageState> {
    return this.state$;
  }

  getPackages(): Observable<Package[]> {
    return this.state$.pipe(
      map(state => state.packages)
    );
  }

  getSelectedPackage(): Observable<Package | null> {
    return this.state$.pipe(
      map(state => state.selectedPackage)
    );
  }

  getCurrentPackage(): Observable<Package | null> {
    return this.state$.pipe(
      map(state => state.currentPackage)
    );
  }

  // State setters
  setPackages(packages: Package[]): void {
    this.updateState({ packages });
  }

  addPackage(pkg: Package): void {
    const current = this.stateSignal();
    this.updateState({
      packages: [...current.packages, pkg]
    });
  }

  updatePackage(updatedPackage: Package): void {
    const current = this.stateSignal();
    this.updateState({
      packages: current.packages.map(p =>
        p.id === updatedPackage.id ? updatedPackage : p
      ),
      selectedPackage: current.selectedPackage?.id === updatedPackage.id
        ? updatedPackage
        : current.selectedPackage,
      currentPackage: current.currentPackage?.id === updatedPackage.id
        ? updatedPackage
        : current.currentPackage
    });
  }

  removePackage(id: string): void {
    const current = this.stateSignal();
    this.updateState({
      packages: current.packages.filter(p => p.id !== id),
      selectedPackage: current.selectedPackage?.id === id
        ? null
        : current.selectedPackage,
      currentPackage: current.currentPackage?.id === id
        ? null
        : current.currentPackage
    });
  }

  setSelectedPackage(pkg: Package | null): void {
    this.updateState({ selectedPackage: pkg });
  }

  setCurrentPackage(pkg: Package | null): void {
    this.updateState({ currentPackage: pkg });
  }

  setFilters(filters: PackageFilters): void {
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
  private updateState(partial: Partial<PackageState>): void {
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
