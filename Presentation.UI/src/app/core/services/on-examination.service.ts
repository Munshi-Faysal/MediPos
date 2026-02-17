import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginationParams } from './api.service';
import { PaginatedList } from '../models';

export interface OnExaminationDto {
    encryptedId?: string | null;
    name: string;
    description?: string | null;
    isActive: boolean;
    doctorEncryptedId?: string | null;
}

export interface OnExaminationViewModel {
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
export class OnExaminationService {
    private api = inject(ApiService);
    private readonly endpoint = 'OnExamination';

    getOnExaminations(params: PaginationParams = {}): Observable<ApiResponse<PaginatedList<OnExaminationViewModel>>> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const requestParams = {
            take: take.toString(),
            skip: skip.toString(),
            ...params
        };

        return this.api.get<ApiResponse<PaginatedList<OnExaminationViewModel>>>(`${this.endpoint}/GetAll`, { params: requestParams });
    }

    getOnExaminationDetails(encryptedId: string): Observable<OnExaminationViewModel> {
        return this.api.get<OnExaminationViewModel>(`${this.endpoint}/Details/${encryptedId}`);
    }

    createOnExamination(dto: OnExaminationDto): Observable<boolean> {
        return this.api.post<boolean>(`${this.endpoint}/Create`, dto);
    }

    updateOnExamination(dto: OnExaminationDto): Observable<boolean> {
        return this.api.put<boolean>(`${this.endpoint}/Edit`, dto);
    }

    changeOnExaminationActiveStatus(encryptedId: string): Observable<boolean> {
        return this.api.patch<boolean>(`${this.endpoint}/ChangeActive/${encryptedId}`);
    }

    getActiveOnExaminationsForCurrentDoctor(): Observable<OnExaminationDto[]> {
        return this.api.get<OnExaminationDto[]>(`${this.endpoint}/CurrentDoctor`);
    }
}
