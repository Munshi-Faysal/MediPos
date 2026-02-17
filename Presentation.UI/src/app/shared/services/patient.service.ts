import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Patient } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients$ = new BehaviorSubject<Patient[]>([]);

  constructor() {
    // Initialize with empty array or load from storage
  }

  getPatients(): Observable<Patient[]> {
    return this.patients$.asObservable();
  }

  getPatientById(id: string): Observable<Patient | undefined> {
    const patients = this.patients$.value;
    const patient = patients.find(p => p.id === id);
    return of(patient);
  }

  createPatient(patient: Patient): Observable<Patient> {
    const current = this.patients$.value;
    const updated = [...current, patient];
    this.patients$.next(updated);
    return of(patient);
  }

  updatePatient(id: string, patient: Patient): Observable<Patient> {
    const current = this.patients$.value;
    const updated = current.map(p => p.id === id ? patient : p);
    this.patients$.next(updated);
    return of(patient);
  }

  deletePatient(id: string): Observable<void> {
    const current = this.patients$.value;
    const updated = current.filter(p => p.id !== id);
    this.patients$.next(updated);
    return of(void 0);
  }

  searchPatients(query: string): Observable<Patient[]> {
    const patients = this.patients$.value;
    const lowerQuery = query.toLowerCase();
    const filtered = patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      (p.email && p.email.toLowerCase().includes(lowerQuery))
    );
    return of(filtered);
  }
}
