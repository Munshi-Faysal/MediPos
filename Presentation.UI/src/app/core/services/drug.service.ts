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

export interface DrugDetailDto {
    id: number | 0;
    encryptedId?: string;
    drugStrengthId: number;
    drugTypeId: number;
    strengthName?: string;
    drugTypeName?: string;
    description?: string;
    unitPrice: number;
    isActive: boolean;
}

export interface DrugDto {
    encryptedId?: string;
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
    drugCompanyId: number;
    genericId: number;
    drugDetails: DrugDetailDto[];
}

export interface DrugDetailViewModel {
    encryptedId: string;
    genericName?: string;
    strengthName?: string;
    drugTypeName?: string;
    description?: string;
    unitPrice: number;
    isActive: boolean;
}

export interface DrugViewModel {
    encryptedId: string;
    name: string;
    description?: string;
    isActive: boolean;
    drugTypeName?: string;
    drugCompanyName?: string;
    code?: string;
    genericName?: string;
    drugStrengthName?: string;
    drugDetailList?: DrugDetailViewModel[];
}

/**
 * Drug Service for managing drugs
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugService {
    private api = inject(ApiService);

    private readonly endpoint = 'Drug';

    /**
     * Get paginated list of drugs
     * Backend uses take/skip, so we convert page/pageSize
     */
    getDrugs(params: PaginationParams & { search?: string, type?: string } = {}): Observable<PagedResponse<DrugViewModel>> {
        const take = params.pageSize || 20;
        const skip = ((params.page || 1) - 1) * take;
        let url = `${this.endpoint}/GetAll?take=${take}&skip=${skip}`;
        if (params.search) {
            url += `&search=${encodeURIComponent(params.search)}`;
        }
        if (params.type && params.type !== 'All') {
            url += `&type=${encodeURIComponent(params.type)}`;
        }
        return this.api.get<ViewResponse<DrugViewModel>>(url).pipe(
            map(response => {
                const itemList = response?.data?.itemList || [];
                const total = response?.data?.totalRecords || itemList.length;
                return {
                    data: itemList,
                    page: params.page || 1,
                    pageSize: take,
                    totalCount: total,
                    totalPages: Math.ceil(total / take) || 1,
                    hasPreviousPage: (params.page || 1) > 1,
                    hasNextPage: (params.page || 1) * take < total
                };
            })
        );
    }

    /**
     * Get drug details
     */
    getDrugDetails(encryptedId: string): Observable<DrugViewModel> {
        return this.api.get<DrugViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    /**
     * Get drug by ID (for edit)
     */
    getDrugById(encryptedId: string): Observable<DrugDto> {
        return this.api.get<DrugDto>(`${this.endpoint}/GetById/${encryptedId}`);
    }

    /**
     * Get drug with all details (for edit)
     */
    getWithDetails(encryptedId: string): Observable<DrugDto> {
        return this.api.get<DrugDto>(`${this.endpoint}/GetWithDetails/${encryptedId}`);
    }

    /**
     * Get active drugs for current doctor
     */
    getActiveDrugsByDoctorId(doctorEncryptedId: string): Observable<DrugDto[]> {
        return this.api.get<DrugDto[]>(`${this.endpoint}/doctor/${doctorEncryptedId}`);
    }

    /**
     * Get drugs by type ID
     */
    getDrugsByTypeId(typeEncryptedId: string): Observable<DrugDto[]> {
        return this.api.get<DrugDto[]>(`${this.endpoint}/type/${typeEncryptedId}`);
    }

    /**
     * Create a new drug
     */
    createDrug(drug: DrugDto): Observable<any> {
        return this.api.post<any>(`${this.endpoint}/Create`, drug);
    }

    /**
     * Update an existing drug
     */
    updateDrug(drug: DrugDto): Observable<any> {
        return this.api.put<any>(`${this.endpoint}/Edit`, drug);
    }

    /**
     * Change active status of drug
     */
    changeDrugActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }

    /**
     * Delete drug
     */
    deleteDrug(encryptedId: string): Observable<any> {
        return this.api.delete<any>(`${this.endpoint}/Delete/${encryptedId}`);
    }
}
