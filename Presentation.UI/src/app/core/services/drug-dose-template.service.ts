import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface DrugDoseTemplateDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    doctorEncryptedId?: string | null;
}

export interface DrugDoseTemplateViewModel {
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
export class DrugDoseTemplateService {
    private api = inject(ApiService);
    private readonly endpoint = 'DrugDoseTemplate';

    getDrugDoseTemplates(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<DrugDoseTemplateViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<DrugDoseTemplateViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    getDrugDoseTemplateDetails(encryptedId: string): Observable<DrugDoseTemplateViewModel> {
        return this.api.get<DrugDoseTemplateViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    createDrugDoseTemplate(dto: DrugDoseTemplateDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    updateDrugDoseTemplate(dto: DrugDoseTemplateDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    changeDrugDoseTemplateActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveDrugDoseByDoctorId(): Observable<DrugDoseTemplateDto[]> {
        return this.api.get<DrugDoseTemplateDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
