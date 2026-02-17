import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
    encryptedId: string;
    patientId: number;
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

    updateStatus(id: string, status: string): Observable<any> {
        return this.apiService.patch(`${this.baseUrl}/${id}/status`, status);
    }
}
