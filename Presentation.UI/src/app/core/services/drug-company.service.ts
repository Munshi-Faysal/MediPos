import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { DrugCompany } from '../models/drug-company.model';

export interface DrugCompanyDto {
    id?: number;
    encryptedId?: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface DrugCompanyViewModel {
    id: number;
    encryptedId: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
}

interface ViewResponse<T> {
    isSuccess: boolean;
    message: string;
    data: {
        itemList: T[];
        totalRecords: number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class DrugCompanyService {
    private api = inject(ApiService);

    private readonly endpoint = '/DrugCompany';

    getCompanies(take = 1000, skip = 0): Observable<DrugCompany[]> {
        return this.api.get<ViewResponse<DrugCompanyViewModel>>(`${this.endpoint}/GetAll?take=${take}&skip=${skip}`).pipe(
            map(response => {
                if (response?.data?.itemList) {
                    return response.data.itemList.map(vm => this.mapToModel(vm));
                }
                return [];
            })
        );
    }

    getCompaniesList(): Observable<DrugCompany[]> {
        return this.getCompanies(1000, 0);
    }

    getActiveCompanies(): Observable<DrugCompany[]> {
        return this.api.get<DrugCompanyDto[]>(`${this.endpoint}/ActiveList`).pipe(
            map(dtos => dtos.map(dto => this.mapDtoToModel(dto)))
        );
    }

    getCompanyById(encryptedId: string): Observable<DrugCompany> {
        return this.api.get<DrugCompanyViewModel>(`${this.endpoint}/GetById/${encryptedId}`).pipe(
            map(vm => this.mapToModel(vm))
        );
    }

    addCompany(company: Omit<DrugCompany, 'id' | 'createdAt'>): Observable<any> {
        const dto: DrugCompanyDto = {
            name: company.name,
            description: company.description,
            displayOrder: company.displayOrder,
            isActive: company.isActive
        };
        return this.api.post<any>(`${this.endpoint}/Create`, dto);
    }

    updateCompany(company: DrugCompany & { encryptedId?: string }): Observable<any> {
        if (!company.encryptedId) {
            throw new Error('EncryptedId is required for update');
        }
        const dto: DrugCompanyDto = {
            encryptedId: company.encryptedId,
            name: company.name,
            description: company.description,
            displayOrder: company.displayOrder,
            isActive: company.isActive
        };
        return this.api.put<any>(`${this.endpoint}/Edit`, dto);
    }

    deleteCompany(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }

    private mapToModel(vm: DrugCompanyViewModel): DrugCompany {
        return {
            id: vm.id,
            encryptedId: vm.encryptedId,
            name: vm.name,
            description: vm.description,
            displayOrder: vm.displayOrder,
            isActive: vm.isActive,
            createdAt: new Date()
        };
    }

    private mapDtoToModel(dto: DrugCompanyDto): DrugCompany {
        return {
            id: dto.id || 0,
            encryptedId: dto.encryptedId,
            name: dto.name,
            description: dto.description,
            displayOrder: dto.displayOrder,
            isActive: dto.isActive,
            createdAt: new Date()
        };
    }
}
