import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface DiseaseDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    doctorEncryptedId?: string | null;
}

export interface DiseaseViewModel {
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
export class DiseaseService {
    private api = inject(ApiService);
    private readonly endpoint = 'Disease';

    getDiseases(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<DiseaseViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<DiseaseViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    getDiseaseDetails(encryptedId: string): Observable<DiseaseViewModel> {
        return this.api.get<DiseaseViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    createDisease(dto: DiseaseDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    updateDisease(dto: DiseaseDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    changeDiseaseActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveDiseasesForCurrentDoctor(): Observable<DiseaseDto[]> {
        return this.api.get<DiseaseDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
