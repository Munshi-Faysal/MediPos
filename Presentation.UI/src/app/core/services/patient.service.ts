import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface PatientDto {
  encryptedId?: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  bloodGroup?: string;
  address?: string;
  image?: string;
}

export interface PatientViewModel {
  encryptedId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  bloodGroup?: string;
  address?: string;
  image?: string;
  lastVisit?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiService = inject(ApiService);

  private readonly baseUrl = 'Patient';

  getAllPatients(take: number = 50): Observable<any> {
    return this.apiService.get(`${this.baseUrl}/list?take=${take}`).pipe(
      map((res: any) => res.data)
    );
  }

  searchPatients(term: string, take: number = 50): Observable<any> {
    return this.apiService.get(`${this.baseUrl}/search?term=${term}&take=${take}`).pipe(
      map((res: any) => res.data)
    );
  }

  getByPhone(phone: string): Observable<any> {
    return this.apiService.get(`${this.baseUrl}/by-phone/${phone}`);
  }

  createPatient(patient: PatientDto): Observable<any> {
    return this.apiService.post(this.baseUrl, patient);
  }

  updatePatient(patient: PatientDto): Observable<any> {
    return this.apiService.put(this.baseUrl, patient);
  }

  // Backward compatibility methods
  getPatients(): Observable<any> {
    return this.getAllPatients();
  }

  getPatientById(id: string): Observable<any> {
    return this.apiService.get(`${this.baseUrl}/${id}`);
  }
}
