import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface DrugDurationTemplateDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    doctorEncryptedId?: string | null;
}

export interface DrugDurationTemplateViewModel {
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
export class DrugDurationTemplateService {
    private api = inject(ApiService);
    private readonly endpoint = 'DrugDurationTemplate';

    getDrugDurationTemplates(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<DrugDurationTemplateViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<DrugDurationTemplateViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    getDrugDurationTemplateDetails(encryptedId: string): Observable<DrugDurationTemplateViewModel> {
        return this.api.get<DrugDurationTemplateViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    createDrugDurationTemplate(dto: DrugDurationTemplateDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    updateDrugDurationTemplate(dto: DrugDurationTemplateDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    changeDrugDurationTemplateActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveDrugDurationTemplatesForCurrentDoctor(): Observable<DrugDurationTemplateDto[]> {
        return this.api.get<DrugDurationTemplateDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
