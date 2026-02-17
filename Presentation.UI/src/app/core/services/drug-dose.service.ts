import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';

export interface DrugDoseDto {
    encryptedId?: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    doctorEncryptedId?: string;
}

export interface DrugDoseViewModel {
    encryptedId: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

/**
 * Drug Dose Service for managing drug doses
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugDoseService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugDose';

    /**
     * Get paginated list of drug doses
     */
    getDrugDoses(params: PaginationParams = {}): Observable<PagedResponse<DrugDoseViewModel>> {
        return this.api.getPaginated<DrugDoseViewModel>(this.endpoint, params);
    }

    /**
     * Get drug dose details
     */
    getDrugDoseDetails(encryptedId: string): Observable<DrugDoseViewModel> {
        return this.api.get<DrugDoseViewModel>(`${this.endpoint}/${encryptedId}`);
    }

    /**
     * Get drug dose by ID (for edit)
     */
    getDrugDoseById(encryptedId: string): Observable<DrugDoseDto> {
        return this.api.get<DrugDoseDto>(`${this.endpoint}/edit/${encryptedId}`);
    }

    /**
     * Get active drug doses for current doctor
     */
    getActiveDrugDosesByDoctorId(doctorEncryptedId: string): Observable<DrugDoseDto[]> {
        return this.api.get<DrugDoseDto[]>(`${this.endpoint}/doctor/${doctorEncryptedId}`);
    }

    /**
     * Create a new drug dose
     */
    createDrugDose(dose: DrugDoseDto): Observable<any> {
        return this.api.post<any>(this.endpoint, dose);
    }

    /**
     * Update an existing drug dose
     */
    updateDrugDose(dose: DrugDoseDto): Observable<any> {
        return this.api.put<any>(this.endpoint, dose);
    }

    /**
     * Change active status of drug dose
     */
    changeDrugDoseActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/change-active/${encryptedId}`, {});
    }
}
