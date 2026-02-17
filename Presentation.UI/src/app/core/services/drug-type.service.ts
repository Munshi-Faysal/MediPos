import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';

interface ViewResponse<T> {
    isSuccess: boolean;
    message: string;
    data: {
        itemList: T[];
        totalRecords: number;
        totalPages: number;
    };
}

export interface DrugTypeDto {
    id?: number;
    encryptedId?: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    doctorEncryptedId?: string;
}

export interface DrugTypeViewModel {
    id: number;
    encryptedId: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

/**
 * Drug Type Service for managing drug types
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugTypeService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugType';

    /**
     * Get paginated list of drug types
     * Backend uses take/skip, so we convert page/pageSize
     */
    getDrugTypes(params: PaginationParams = {}): Observable<PagedResponse<DrugTypeViewModel>> {
        const take = params.pageSize || 1000;
        const skip = ((params.page || 1) - 1) * take;
        return this.api.get<ViewResponse<DrugTypeViewModel>>(`${this.endpoint}/GetAll?take=${take}&skip=${skip}`).pipe(
            map(response => {
                const itemList = response?.data?.itemList || [];
                return {
                    data: itemList,
                    page: params.page || 1,
                    pageSize: take,
                    totalCount: response?.data?.totalRecords || itemList.length,
                    totalPages: response?.data?.totalPages || 1,
                    hasPreviousPage: (params.page || 1) > 1,
                    hasNextPage: false // Would need totalRecords to calculate properly
                };
            })
        );
    }

    /**
     * Get drug type details
     */
    getDrugTypeDetails(encryptedId: string): Observable<DrugTypeViewModel> {
        return this.api.get<DrugTypeViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    /**
     * Get drug type by ID (for edit)
     */
    getDrugTypeById(encryptedId: string): Observable<DrugTypeDto> {
        return this.api.get<DrugTypeDto>(`${this.endpoint}/GetById/${encryptedId}`);
    }

    /**
     * Get active drug types for current doctor
     */
    getActiveDrugTypesByDoctorId(doctorEncryptedId: string): Observable<DrugTypeDto[]> {
        return this.api.get<DrugTypeDto[]>(`${this.endpoint}/doctor/${doctorEncryptedId}`);
    }

    /**
     * Get active drug types for current doctor (session-based)
     */
    getActiveDrugTypesForCurrentDoctor(): Observable<DrugTypeDto[]> {
        return this.api.get<DrugTypeDto[]>(`${this.endpoint}/CurrentDoctor`);
    }

    /**
     * Create a new drug type
     */
    createDrugType(type: DrugTypeDto): Observable<any> {
        return this.api.post<any>(`${this.endpoint}/Create`, type);
    }

    /**
     * Update an existing drug type
     */
    updateDrugType(type: DrugTypeDto): Observable<any> {
        return this.api.put<any>(`${this.endpoint}/Edit`, type);
    }

    /**
     * Change active status of drug type
     */
    changeDrugTypeActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }
}
