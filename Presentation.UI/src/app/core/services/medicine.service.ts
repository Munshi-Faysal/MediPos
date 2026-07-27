import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { Medicine, MedicineForm, MedicineFilters, DrugMaster } from '../models/medicine.model';
import { ApiService } from './api.service';

interface ViewResponse<T> {
  data?: {
    itemList?: T[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'Drug';

  // In-memory storage for demo (will be replaced with API calls)
  private medicinesSubject = new BehaviorSubject<Medicine[]>([]);
  public medicines$ = this.medicinesSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Automatic load removed to prevent 404 on non-existent endpoint
  }

  /**
   * Get all medicines
   */
  getMedicines(): Observable<Medicine[]> {
    this.loadingSubject.next(true);

    return this.apiService.get<ViewResponse<DrugMaster>>(`${this.endpoint}/GetAll?take=1000&skip=0`).pipe(
      map(response => {
        const medicines = (response?.data?.itemList || []).map(drug => this.mapDrugMasterToMedicine(drug));
        this.medicinesSubject.next(medicines);
        return medicines;
      }),
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Get medicine by ID
   */
  getMedicineById(id: string): Observable<Medicine> {
    return this.apiService.get<DrugMaster>(`${this.endpoint}/Details/${id}`).pipe(
      map(drug => this.mapDrugMasterToMedicine(drug))
    );
  }

  /**
   * Create new medicine
   */
  createMedicine(medicine: Medicine): Observable<Medicine> {
    this.loadingSubject.next(true);

    return this.apiService.post<Medicine>(this.endpoint, medicine).pipe(
      tap(createdMedicine => {
        const current = this.medicinesSubject.value;
        this.medicinesSubject.next([...current, createdMedicine]);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return of(medicine);
      })
    );
  }

  /**
   * Update existing medicine
   */
  updateMedicine(id: string, medicine: Medicine): Observable<Medicine> {
    this.loadingSubject.next(true);

    return this.apiService.put<Medicine>(`${this.endpoint}/${id}`, medicine).pipe(
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
        this.loadingSubject.next(false);
        return of(medicine);
      })
    );
  }

  /**
   * Delete medicine
   */
  deleteMedicine(id: string): Observable<void> {
    this.loadingSubject.next(true);

    return this.apiService.patch<boolean>(`${this.endpoint}/ChangeActive/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError(() => {
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
    return this.apiService.get<DrugMaster[]>(`${this.endpoint}/Search?term=${term}`);
  }

  /**
   * Search medicines by query string (backward compatibility)
   */
  searchMedicines(query: string): Observable<Medicine[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const searchTerm = query.toLowerCase().trim();
    const medicines = this.medicinesSubject.value;

    const filtered = medicines.filter(medicine =>
      medicine.genericName.toLowerCase().includes(searchTerm) ||
      medicine.companyName.toLowerCase().includes(searchTerm) ||
      medicine.medicineName.toLowerCase().includes(searchTerm) ||
      medicine.variation.toLowerCase().includes(searchTerm)
    );

    return of(filtered).pipe(delay(200));
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
    this.getMedicines().subscribe();
  }

  private mapDrugMasterToMedicine(drug: DrugMaster): Medicine {
    const firstDetail = drug.drugDetailList?.[0];

    return {
      id: drug.encryptedId || (drug as any).id?.toString() || '',
      genericName: drug.drugGenericName || '',
      companyName: drug.drugCompanyName || '',
      medicineName: drug.name || '',
      pack: firstDetail?.description || '',
      variation: firstDetail?.strengthName || '',
      form: (firstDetail?.drugTypeName as MedicineForm) || MedicineForm.TABLET,
      price: firstDetail?.unitPrice || 0,
      stockQuantity: 0,
      expiryDate: undefined,
      batchNumber: '',
      manufacturerDetails: drug.drugCompanyName || '',
      category: '',
      description: (drug as any).description || firstDetail?.description || '',
      isActive: (drug as any).isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate unique ID (for demo purposes)
   */
  private generateId(): string {
    return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
