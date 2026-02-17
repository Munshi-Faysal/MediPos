import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface ChiefComplaintDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    displayOrder: number;
    doctorEncryptedId?: string | null;
}

export interface ChiefComplaintViewModel {
    encryptedId: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    displayOrder: number;
    createdDate?: string | null;
    updatedDate?: string | null;
}

export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class ChiefComplaintService {
    private api = inject(ApiService);
    private readonly endpoint = 'ChiefComplaint';

    /**
     * Get paginated list of chief complaints
     */
    getChiefComplaints(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<ChiefComplaintViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<ChiefComplaintViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    /**
     * Get details by ID
     */
    getChiefComplaintDetails(encryptedId: string): Observable<ChiefComplaintViewModel> {
        return this.api.get<ChiefComplaintViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    /**
     * Create new chief complaint
     */
    createChiefComplaint(dto: ChiefComplaintDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    /**
     * Update existing chief complaint
     */
    updateChiefComplaint(dto: ChiefComplaintDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    /**
     * Change active status
     */
    changeChiefComplaintActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveChiefComplaintsForCurrentDoctor(): Observable<ChiefComplaintDto[]> {
        return this.api.get<ChiefComplaintDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
