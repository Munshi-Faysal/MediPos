import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {  delay, tap, catchError } from 'rxjs/operators';
import { Medicine, MedicineForm, MedicineFilters, DrugMaster } from '../models/medicine.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiService = inject(ApiService);

  // In-memory storage for demo (will be replaced with API calls)
  private medicinesSubject = new BehaviorSubject<Medicine[]>([]);
  public medicines$ = this.medicinesSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Initialize with empty array or load from API
    this.loadMedicines();
  }

  /**
   * Get all medicines
   */
  getMedicines(): Observable<Medicine[]> {
    this.loadingSubject.next(true);

    // For demo: return from subject, for production: use API
    return this.apiService.get<Medicine[]>('/medicines').pipe(
      tap(medicines => {
        this.medicinesSubject.next(medicines);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        // Fallback to in-memory data for demo
        this.loadingSubject.next(false);
        return this.medicines$;
      })
    );
  }

  /**
   * Get medicine by ID
   */
  getMedicineById(id: string): Observable<Medicine> {
    return this.apiService.get<Medicine>(`/medicines/${id}`).pipe(
      catchError(() => {
        // Fallback: search in-memory data
        const medicines = this.medicinesSubject.value;
        const medicine = medicines.find(m => m.id === id);
        if (medicine) {
          return of(medicine);
        }
        throw new Error('Medicine not found');
      })
    );
  }

  /**
   * Create new medicine
   */
  createMedicine(medicine: Medicine): Observable<Medicine> {
    this.loadingSubject.next(true);

    const newMedicine: Medicine = {
      ...medicine,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.apiService.post<Medicine>('/medicines', newMedicine).pipe(
      tap(createdMedicine => {
        const current = this.medicinesSubject.value;
        this.medicinesSubject.next([...current, createdMedicine]);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        // Fallback: add to in-memory data
        const current = this.medicinesSubject.value;
        this.medicinesSubject.next([...current, newMedicine]);
        this.loadingSubject.next(false);
        return of(newMedicine);
      })
    );
  }

  /**
   * Update existing medicine
   */
  updateMedicine(id: string, medicine: Medicine): Observable<Medicine> {
    this.loadingSubject.next(true);

    const updatedMedicine: Medicine = {
      ...medicine,
      id,
      updatedAt: new Date()
    };

    return this.apiService.put<Medicine>(`/medicines/${id}`, updatedMedicine).pipe(
      tap(updated => {
        const current = this.medicinesSubject.value;
        const index = current.findIndex(m => m.id === id);
        if (index !== -1) {
          current[index] = updated;
          this.medicinesSubject.next([...current]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        // Fallback: update in-memory data
        const current = this.medicinesSubject.value;
        const index = current.findIndex(m => m.id === id);
        if (index !== -1) {
          current[index] = updatedMedicine;
          this.medicinesSubject.next([...current]);
        }
        this.loadingSubject.next(false);
        return of(updatedMedicine);
      })
    );
  }

  /**
   * Delete medicine
   */
  deleteMedicine(id: string): Observable<void> {
    this.loadingSubject.next(true);

    return this.apiService.delete<void>(`/medicines/${id}`).pipe(
      tap(() => {
        const current = this.medicinesSubject.value;
        this.medicinesSubject.next(current.filter(m => m.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        // Fallback: remove from in-memory data
        const current = this.medicinesSubject.value;
        this.medicinesSubject.next(current.filter(m => m.id !== id));
        this.loadingSubject.next(false);
        return of(void 0);
      })
    );
  }

  /**
   * Search drug masters (Brand - Generic - Company with details)
   */
  searchDrugMasters(term: string): Observable<DrugMaster[]> {
    if (!term || term.trim() === '') {
      return of([]);
    }
    return this.apiService.get<DrugMaster[]>(`/Drug/Search?term=${term}`);
  }

  /**
   * Search medicines by query string
   */
  searchMedicines(query: string): Observable<Medicine[]> {
    if (!query || query.trim() === '') {
      return this.getMedicines();
    }

    const searchTerm = query.toLowerCase().trim();
    const medicines = this.medicinesSubject.value;

    const filtered = medicines.filter(medicine =>
      medicine.genericName.toLowerCase().includes(searchTerm) ||
      medicine.companyName.toLowerCase().includes(searchTerm) ||
      medicine.medicineName.toLowerCase().includes(searchTerm) ||
      medicine.variation.toLowerCase().includes(searchTerm)
    );

    return of(filtered).pipe(delay(200)); // Simulate API delay
  }

  /**
   * Filter medicines by multiple criteria
   */
  filterMedicines(filters: MedicineFilters): Observable<Medicine[]> {
    let medicines = [...this.medicinesSubject.value];

    if (filters.genericName) {
      medicines = medicines.filter(m =>
        m.genericName.toLowerCase().includes(filters.genericName!.toLowerCase())
      );
    }

    if (filters.companyName) {
      medicines = medicines.filter(m =>
        m.companyName.toLowerCase().includes(filters.companyName!.toLowerCase())
      );
    }

    if (filters.medicineName) {
      medicines = medicines.filter(m =>
        m.medicineName.toLowerCase().includes(filters.medicineName!.toLowerCase())
      );
    }

    if (filters.form) {
      medicines = medicines.filter(m => m.form === filters.form);
    }

    if (filters.category) {
      medicines = medicines.filter(m =>
        m.category?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      medicines = medicines.filter(m =>
        m.genericName.toLowerCase().includes(searchTerm) ||
        m.companyName.toLowerCase().includes(searchTerm) ||
        m.medicineName.toLowerCase().includes(searchTerm) ||
        m.variation.toLowerCase().includes(searchTerm)
      );
    }

    return of(medicines).pipe(delay(200));
  }

  /**
   * Get medicines by form
   */
  getMedicinesByForm(form: MedicineForm): Observable<Medicine[]> {
    const medicines = this.medicinesSubject.value;
    return of(medicines.filter(m => m.form === form));
  }

  /**
   * Get medicines by category
   */
  getMedicinesByCategory(category: string): Observable<Medicine[]> {
    const medicines = this.medicinesSubject.value;
    return of(medicines.filter(m => m.category?.toLowerCase() === category.toLowerCase()));
  }

  /**
   * Load medicines (initialize or refresh)
   */
  private loadMedicines(): void {
    // Load medicines from API on service initialization
    this.getMedicines().subscribe();
  }

  /**
   * Generate unique ID (for demo purposes)
   */
  private generateId(): string {
    return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
