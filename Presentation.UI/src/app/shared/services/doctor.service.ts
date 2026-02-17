import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Doctor } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private doctors$ = new BehaviorSubject<Doctor[]>([]);

  constructor() {
    // Initialize with empty array or load from storage
  }

  getDoctors(): Observable<Doctor[]> {
    return this.doctors$.asObservable();
  }

  getDoctorById(id: string): Observable<Doctor | undefined> {
    const doctors = this.doctors$.value;
    const doctor = doctors.find(d => d.id === id);
    return of(doctor);
  }

  createDoctor(doctor: Doctor): Observable<Doctor> {
    const current = this.doctors$.value;
    const updated = [...current, doctor];
    this.doctors$.next(updated);
    return of(doctor);
  }

  updateDoctor(id: string, doctor: Doctor): Observable<Doctor> {
    const current = this.doctors$.value;
    const updated = current.map(d => d.id === id ? doctor : d);
    this.doctors$.next(updated);
    return of(doctor);
  }

  deleteDoctor(id: string): Observable<void> {
    const current = this.doctors$.value;
    const updated = current.filter(d => d.id !== id);
    this.doctors$.next(updated);
    return of(void 0);
  }

  getDoctorsWithExpiringLicenses(days: number): Observable<Doctor[]> {
    const doctors = this.doctors$.value;
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + days);

    const expiring = doctors.filter(d => {
      const expiry = new Date(d.licenseExpiryDate);
      return expiry <= expiryDate && expiry >= today;
    });

    return of(expiring);
  }

  getDoctorsWithUpcomingBilling(days: number): Observable<Doctor[]> {
    const doctors = this.doctors$.value;
    const today = new Date();
    const billingDate = new Date();
    billingDate.setDate(today.getDate() + days);

    const upcoming = doctors.filter(d => {
      const billing = new Date(d.billingDate);
      return billing <= billingDate && billing >= today;
    });

    return of(upcoming);
  }
}
