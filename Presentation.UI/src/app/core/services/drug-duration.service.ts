import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';

export interface DrugDurationDto {
    encryptedId?: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    doctorEncryptedId?: string;
}

export interface DrugDurationViewModel {
    encryptedId: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

/**
 * Drug Duration Service for managing drug durations
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugDurationService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugDuration';

    /**
     * Get paginated list of drug durations
     */
    getDrugDurations(params: PaginationParams = {}): Observable<PagedResponse<DrugDurationViewModel>> {
        return this.api.getPaginated<DrugDurationViewModel>(this.endpoint, params);
    }

    /**
     * Get drug duration details
     */
    getDrugDurationDetails(encryptedId: string): Observable<DrugDurationViewModel> {
        return this.api.get<DrugDurationViewModel>(`${this.endpoint}/${encryptedId}`);
    }

    /**
     * Get drug duration by ID (for edit)
     */
    getDrugDurationById(encryptedId: string): Observable<DrugDurationDto> {
        return this.api.get<DrugDurationDto>(`${this.endpoint}/edit/${encryptedId}`);
    }

    /**
     * Get active drug durations for current doctor
     */
    getActiveDrugDurationsByDoctorId(doctorEncryptedId: string): Observable<DrugDurationDto[]> {
        return this.api.get<DrugDurationDto[]>(`${this.endpoint}/doctor/${doctorEncryptedId}`);
    }

    /**
     * Get active drug durations for current doctor (session-based)
     */
    getActiveDrugDurationsForCurrentDoctor(): Observable<DrugDurationDto[]> {
        return this.api.get<DrugDurationDto[]>(`${this.endpoint}/CurrentDoctor`);
    }

    /**
     * Create a new drug duration
     */
    createDrugDuration(duration: DrugDurationDto): Observable<any> {
        return this.api.post<any>(this.endpoint, duration);
    }

    /**
     * Update an existing drug duration
     */
    updateDrugDuration(duration: DrugDurationDto): Observable<any> {
        return this.api.put<any>(this.endpoint, duration);
    }

    /**
     * Change active status of drug duration
     */
    changeDrugDurationActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/change-active/${encryptedId}`, {});
    }
}
