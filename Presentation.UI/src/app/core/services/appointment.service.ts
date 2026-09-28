import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AppointmentDto {
    encryptedId?: string;
    patientId: number;
    doctorId: number;
    dateTime: Date | string;
    reason?: string;
    status: string;
    type: string;
    notes?: string;
}

export interface AppointmentViewModel {
    id: number;
    encryptedId: string;
    patientId: number;
    patientEncryptedId?: string;
    patientName: string;
    patientImage?: string;
    patientPhone: string;
    doctorId: number;
    doctorName: string;
    dateTime: Date | string;
    reason?: string;
    status: string;
    type: string;
    notes?: string;
    prescriptionEncryptedId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private apiService = inject(ApiService);

    private readonly baseUrl = 'Appointment';

    getAppointmentsByDoctor(doctorId: string): Observable<any> {
        return this.apiService.get(`${this.baseUrl}/doctor/${doctorId}`);
    }

    getAppointmentsByCurrentDoctor(): Observable<any> {
        return this.apiService.get(`${this.baseUrl}/doctor/current`);
    }

    getAppointmentsByDate(doctorId: string, date: string): Observable<any> {
        return this.apiService.get(`${this.baseUrl}/doctor/${doctorId}/date/${date}`);
    }

    getAppointmentsByCurrentDoctorAndDate(date: string): Observable<any> {
        return this.apiService.get(`${this.baseUrl}/doctor/current/date/${date}`);
    }

    createAppointment(appointment: AppointmentDto): Observable<any> {
        return this.apiService.post(this.baseUrl, appointment);
    }

    updateAppointment(appointment: AppointmentDto): Observable<any> {
        return this.apiService.put(this.baseUrl, appointment);
    }

    getAppointmentById(id: string): Observable<AppointmentViewModel> {
        return this.apiService.get(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
            map((response: any) => response.data)
        );
    }

    updateStatus(id: string, status: string): Observable<any> {
        return this.apiService.patch(`${this.baseUrl}/${encodeURIComponent(id)}/status`, { status });
    }
}
