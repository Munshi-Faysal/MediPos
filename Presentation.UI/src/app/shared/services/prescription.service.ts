import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Prescription } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private prescriptions$ = new BehaviorSubject<Prescription[]>([]);

  constructor() {
    // Initialize with empty array or load from storage
  }

  getPrescriptions(doctorId?: string): Observable<Prescription[]> {
    const prescriptions = this.prescriptions$.value;
    if (doctorId) {
      return of(prescriptions.filter(p => p.doctorId === doctorId));
    }
    return this.prescriptions$.asObservable();
  }

  getPrescriptionById(id: string): Observable<Prescription | undefined> {
    const prescriptions = this.prescriptions$.value;
    const prescription = prescriptions.find(p => p.id === id);
    return of(prescription);
  }

  createPrescription(prescription: Prescription): Observable<Prescription> {
    const current = this.prescriptions$.value;
    const updated = [...current, prescription];
    this.prescriptions$.next(updated);
    return of(prescription);
  }

  updatePrescription(id: string, prescription: Prescription): Observable<Prescription> {
    const current = this.prescriptions$.value;
    const updated = current.map(p => p.id === id ? prescription : p);
    this.prescriptions$.next(updated);
    return of(prescription);
  }

  deletePrescription(id: string): Observable<void> {
    const current = this.prescriptions$.value;
    const updated = current.filter(p => p.id !== id);
    this.prescriptions$.next(updated);
    return of(void 0);
  }

  getPrescriptionsByDoctor(doctorId: string): Observable<Prescription[]> {
    const prescriptions = this.prescriptions$.value;
    const filtered = prescriptions.filter(p => p.doctorId === doctorId);
    return of(filtered);
  }

  getPrescriptionsByDateRange(start: Date, end: Date): Observable<Prescription[]> {
    const prescriptions = this.prescriptions$.value;
    const filtered = prescriptions.filter(p => {
      const prescriptionDate = new Date(p.prescriptionDate);
      return prescriptionDate >= start && prescriptionDate <= end;
    });
    return of(filtered);
  }
}
