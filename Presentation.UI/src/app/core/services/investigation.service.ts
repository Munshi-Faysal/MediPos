import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface InvestigationDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    doctorEncryptedId?: string | null;
}

export interface InvestigationViewModel {
    encryptedId: string;
    name: string;
    description?: string | null;
    isActive: boolean;
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
export class InvestigationService {
    private api = inject(ApiService);
    private readonly endpoint = 'Investigation';

    getInvestigations(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<InvestigationViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<InvestigationViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    getInvestigationDetails(encryptedId: string): Observable<InvestigationViewModel> {
        return this.api.get<InvestigationViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    createInvestigation(dto: InvestigationDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    updateInvestigation(dto: InvestigationDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    changeInvestigationActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveInvestigationsForCurrentDoctor(): Observable<InvestigationDto[]> {
        return this.api.get<InvestigationDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
