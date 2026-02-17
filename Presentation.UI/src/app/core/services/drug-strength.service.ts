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

export interface DrugStrengthDto {
    id?: number;
    encryptedId?: string;
    quantity: string;
    unitEncryptedId?: string;
    unitName?: string;
    isActive: boolean;
    doctorEncryptedId?: string;
}

export interface DrugStrengthViewModel {
    id: number;
    encryptedId: string;
    quantity: string;
    unitName?: string;
    isActive: boolean;
}

export interface DropdownItem {
    id: string;
    value: string;
}

export interface DrugStrengthInitDto {
    unitList: DropdownItem[];
}


/**
 * Drug Strength Service for managing drug strengths
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class DrugStrengthService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugStrength';

    /**
     * Get paginated list of drug strengths
     * Backend uses take/skip, so we convert page/pageSize
     */
    getDrugStrengths(params: PaginationParams = {}): Observable<PagedResponse<DrugStrengthViewModel>> {
        const take = params.pageSize || 1000;
        const skip = ((params.page || 1) - 1) * take;
        return this.api.get<ViewResponse<DrugStrengthViewModel>>(`${this.endpoint}/GetAll?take=${take}&skip=${skip}`).pipe(
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
     * Get drug strength details
     */
    getDrugStrengthDetails(encryptedId: string): Observable<DrugStrengthViewModel> {
        return this.api.get<DrugStrengthViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    /**
     * Get drug strength by ID (for edit)
     */
    getDrugStrengthById(encryptedId: string): Observable<DrugStrengthDto> {
        return this.api.get<DrugStrengthDto>(`${this.endpoint}/GetById/${encryptedId}`);
    }

    /**
     * Get active drug strengths for current doctor
     */
    getActiveDrugStrengthsByDoctorId(doctorEncryptedId: string): Observable<DrugStrengthDto[]> {
        return this.api.get<DrugStrengthDto[]>(`${this.endpoint}/doctor/${doctorEncryptedId}`);
    }

    /**
     * Get active drug strengths for current doctor (session-based)
     */
    getActiveDrugStrengthsForCurrentDoctor(): Observable<DrugStrengthDto[]> {
        return this.api.get<DrugStrengthDto[]>(`${this.endpoint}/CurrentDoctor`);
    }

    /**
     * Create a new drug strength
     */
    createDrugStrength(strength: DrugStrengthDto): Observable<any> {
        return this.api.post<any>(`${this.endpoint}/Create`, strength);
    }

    /**
     * Update an existing drug strength
     */
    updateDrugStrength(strength: DrugStrengthDto): Observable<any> {
        return this.api.put<any>(`${this.endpoint}/Edit`, strength);
    }

    /**
     * Change active status of drug strength
     */
    changeDrugStrengthActiveStatus(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }

    /**
     * Get initialization data (dropdowns)
     */
    getInitObject(): Observable<DrugStrengthInitDto> {
        return this.api.get<DrugStrengthInitDto>(`${this.endpoint}/Init`);
    }
}
