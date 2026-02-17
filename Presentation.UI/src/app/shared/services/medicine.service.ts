import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Medicine, MedicineFilters } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private medicines$ = new BehaviorSubject<Medicine[]>([]);

  constructor() {
    // Initialize with empty array or load from storage
  }

  getMedicines(): Observable<Medicine[]> {
    return this.medicines$.asObservable();
  }

  getMedicineById(id: string): Observable<Medicine | undefined> {
    const medicines = this.medicines$.value;
    const medicine = medicines.find(m => m.id === id);
    return of(medicine);
  }

  createMedicine(medicine: Medicine): Observable<Medicine> {
    const current = this.medicines$.value;
    const updated = [...current, medicine];
    this.medicines$.next(updated);
    return of(medicine);
  }

  updateMedicine(id: string, medicine: Medicine): Observable<Medicine> {
    const current = this.medicines$.value;
    const updated = current.map(m => m.id === id ? medicine : m);
    this.medicines$.next(updated);
    return of(medicine);
  }

  deleteMedicine(id: string): Observable<void> {
    const current = this.medicines$.value;
    const updated = current.filter(m => m.id !== id);
    this.medicines$.next(updated);
    return of(void 0);
  }

  searchMedicines(query: string): Observable<Medicine[]> {
    const medicines = this.medicines$.value;
    const lowerQuery = query.toLowerCase();
    const filtered = medicines.filter(m =>
      m.genericName.toLowerCase().includes(lowerQuery) ||
      m.companyName.toLowerCase().includes(lowerQuery) ||
      m.medicineName.toLowerCase().includes(lowerQuery)
    );
    return of(filtered);
  }

  filterMedicines(filters: MedicineFilters): Observable<Medicine[]> {
    const medicines = this.medicines$.value;
    let filtered = medicines;

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
      filtered = filtered.filter(m => m.category === filters.category);
    }

    return of(filtered);
  }
}
