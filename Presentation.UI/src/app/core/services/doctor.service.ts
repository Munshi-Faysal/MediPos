import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { Doctor, DoctorStatus, DoctorFilters } from '../models/doctor.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiService = inject(ApiService);

  // In-memory storage for demo
  private doctorsSubject = new BehaviorSubject<Doctor[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadDoctors();
  }

  /**
   * Get all doctors
   */
  getDoctors(): Observable<Doctor[]> {
    this.loadingSubject.next(true);

    return this.apiService.get<Doctor[]>('doctors').pipe(
      map(doctors => doctors || []),
      tap(doctors => {
        this.doctorsSubject.next(doctors);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return this.doctors$;
      })
    );
  }

  /**
   * Get doctor by ID
   */
  getDoctorById(id: string): Observable<Doctor> {
    return this.apiService.get<Doctor>(`doctors/${id}`).pipe(
      catchError(() => {
        const doctors = this.doctorsSubject.value;
        const doctor = doctors.find(d => d.id === id);
        if (doctor) {
          return of(doctor);
        }
        throw new Error('Doctor not found');
      })
    );
  }

  /**
   * Create new doctor
   */
  createDoctor(doctor: Doctor): Observable<Doctor> {
    this.loadingSubject.next(true);

    const newDoctor: Doctor = {
      ...doctor,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.apiService.post<Doctor>('doctors', newDoctor).pipe(
      tap(createdDoctor => {
        const current = this.doctorsSubject.value;
        this.doctorsSubject.next([...current, createdDoctor]);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.doctorsSubject.value;
        this.doctorsSubject.next([...current, newDoctor]);
        this.loadingSubject.next(false);
        return of(newDoctor);
      })
    );
  }

  /**
   * Update existing doctor
   */
  updateDoctor(id: string, doctor: Doctor): Observable<Doctor> {
    this.loadingSubject.next(true);

    const updatedDoctor: Doctor = {
      ...doctor,
      id,
      updatedAt: new Date()
    };

    return this.apiService.put<Doctor>(`doctors/${id}`, updatedDoctor).pipe(
      tap(updated => {
        const current = this.doctorsSubject.value;
        const index = current.findIndex(d => d.id === id);
        if (index !== -1) {
          current[index] = updated;
          this.doctorsSubject.next([...current]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.doctorsSubject.value;
        const index = current.findIndex(d => d.id === id);
        if (index !== -1) {
          current[index] = updatedDoctor;
          this.doctorsSubject.next([...current]);
        }
        this.loadingSubject.next(false);
        return of(updatedDoctor);
      })
    );
  }

  /**
   * Delete doctor
   */
  deleteDoctor(id: string): Observable<void> {
    this.loadingSubject.next(true);

    return this.apiService.delete<void>(`doctors/${id}`).pipe(
      tap(() => {
        const current = this.doctorsSubject.value;
        this.doctorsSubject.next(current.filter(d => d.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.doctorsSubject.value;
        this.doctorsSubject.next(current.filter(d => d.id !== id));
        this.loadingSubject.next(false);
        return of(void 0);
      })
    );
  }

  /**
   * Get doctors with expiring licenses
   */
  getDoctorsWithExpiringLicenses(days = 30): Observable<Doctor[]> {
    const doctors = this.doctorsSubject.value;
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + days);

    const expiringDoctors = doctors.filter(doctor => {
      const licenseExpiry = new Date(doctor.licenseExpiryDate);
      return licenseExpiry <= expiryDate && licenseExpiry >= today && doctor.status === DoctorStatus.ACTIVE;
    });

    return of(expiringDoctors).pipe(delay(200));
  }

  /**
   * Get doctors with upcoming billing dates
   */
  getDoctorsWithUpcomingBilling(days = 7): Observable<Doctor[]> {
    const doctors = this.doctorsSubject.value;
    const today = new Date();
    const billingDate = new Date();
    billingDate.setDate(today.getDate() + days);

    const upcomingBilling = doctors.filter(doctor => {
      const billing = new Date(doctor.billingDate);
      return billing <= billingDate && billing >= today && doctor.status === DoctorStatus.ACTIVE;
    });

    return of(upcomingBilling).pipe(delay(200));
  }

  /**
   * Filter doctors
   */
  filterDoctors(filters: DoctorFilters): Observable<Doctor[]> {
    let doctors = [...this.doctorsSubject.value];

    if (filters.name) {
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.licenseNumber) {
      doctors = doctors.filter(d =>
        d.licenseNumber.toLowerCase().includes(filters.licenseNumber!.toLowerCase())
      );
    }

    if (filters.status) {
      doctors = doctors.filter(d => d.status === filters.status);
    }

    if (filters.specialization) {
      doctors = doctors.filter(d =>
        d.specialization?.toLowerCase().includes(filters.specialization!.toLowerCase())
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        d.licenseNumber.toLowerCase().includes(searchTerm) ||
        d.email.toLowerCase().includes(searchTerm) ||
        d.specialization?.toLowerCase().includes(searchTerm)
      );
    }

    return of(doctors).pipe(delay(200));
  }

  /**
   * Get doctors by package ID
   */
  getDoctorsByPackage(packageId: string): Observable<Doctor[]> {
    const doctors = this.doctorsSubject.value;
    return of(doctors.filter(d => d.packageId === packageId));
  }

  /**
   * Get active doctors
   */
  getActiveDoctors(): Observable<Doctor[]> {
    const doctors = this.doctorsSubject.value;
    return of(doctors.filter(d => d.status === DoctorStatus.ACTIVE));
  }

  /**
   * Load doctors (initialize or refresh)
   */
  private loadDoctors(): void {
    // Load doctors from API on service initialization
    this.getDoctors().subscribe();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
