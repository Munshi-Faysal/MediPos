import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginationParams } from '../models';

export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}

export interface PaginatedList<T> {
    itemList: T[];
    totalRecords: number;
    totalPages: number;
}

export interface DrugAdviceDto {
    encryptedId?: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    doctorEncryptedId?: string;
}

export interface DrugAdviceViewModel {
    encryptedId: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

/**
 * Drug Advice Service for managing drug advice
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugAdviceService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugAdvice';

    /**
     * Get paginated list of drug advices
     */
    getDrugAdvices(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<DrugAdviceViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };
        // Remove page and pageSize from requestParams to avoid confusion if needed, 
        // but keeping them doesn't hurt usually. The backend ignores them if not bound.

        return this.api.get<ApiResponse<PaginatedList<DrugAdviceViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    /**
     * Get drug advice details
     */
    getDrugAdviceDetails(encryptedId: string): Observable<DrugAdviceViewModel> {
        return this.api.get<DrugAdviceViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    /**
     * Get drug advice by ID (for edit)
     */
    getDrugAdviceById(encryptedId: string): Observable<DrugAdviceDto> {
        return this.api.get<DrugAdviceDto>(`${this.endpoint}/GetById/${encryptedId}`);
    }

    /**
     * Get active drug advices for current doctor
     */
    getActiveDrugAdvicesByDoctorId(doctorEncryptedId: string): Observable<DrugAdviceDto[]> {
        return this.api.get<DrugAdviceDto[]>(`${this.endpoint}/Doctor/${doctorEncryptedId}`);
    }

    /**
     * Get active drug advices for current doctor (session-based)
     */
    getActiveDrugAdvicesForCurrentDoctor(): Observable<DrugAdviceDto[]> {
        return this.api.get<DrugAdviceDto[]>(`${this.endpoint}/CurrentDoctor`);
    }

    /**
     * Create a new drug advice
     */
    createDrugAdvice(advice: DrugAdviceDto): Observable<any> {
        return this.api.post<any>(`${this.endpoint}/Create`, advice);
    }

    /**
     * Update an existing drug advice
     */
    updateDrugAdvice(advice: DrugAdviceDto): Observable<any> {
        return this.api.put<any>(`${this.endpoint}/Edit`, advice);
    }

    /**
     * Change active status of drug advice
     */
    changeDrugAdviceActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }
}
