import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Prescription } from '../models/prescription.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private api = inject(ApiService);
  private readonly endpoint = 'Prescription';

  getPrescriptions(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
  }

  getPrescriptionById(encryptedId: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${encryptedId}`);
  }

  createPrescription(data: any): Observable<any> {
    return this.api.post<any>(this.endpoint, data);
  }

  updatePrescription(data: any): Observable<any> {
    return this.api.put<any>(this.endpoint, data);
  }

  deletePrescription(encryptedId: string): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${encryptedId}`);
  }

  // Legacy compatibility methods
  prescriptions$ = this.getPrescriptions();

  getPrescriptionsByDoctor(doctorId: string): Observable<any[]> {
    return this.getPrescriptions();
  }

  filterPrescriptions(filters: any): Observable<any[]> {
    // For now, return all prescriptions - filtering can be done client-side
    return this.getPrescriptions();
  }
}
