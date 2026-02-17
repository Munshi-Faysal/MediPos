import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { DrugGeneric } from '../models/drug-generic.model';

export interface GenericDto {
    id?: number;
    encryptedId?: string;
    name: string;
    indication?: string;
    sideEffects?: string;
    isActive: boolean;
}

export interface GenericViewModel {
    id: number;
    encryptedId: string;
    name: string;
    indication?: string;
    sideEffects?: string;
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
export class DrugGenericService {
    private api = inject(ApiService);

    private readonly endpoint = '/Generic';

    getGenerics(take = 1000, skip = 0): Observable<DrugGeneric[]> {
        return this.api.get<ViewResponse<GenericViewModel>>(`${this.endpoint}/GetAll?take=${take}&skip=${skip}`).pipe(
            map(response => {
                if (response?.data?.itemList) {
                    return response.data.itemList.map(vm => this.mapToModel(vm));
                }
                return [];
            })
        );
    }

    getActiveGenerics(): Observable<DrugGeneric[]> {
        return this.api.get<GenericDto[]>(`${this.endpoint}/ActiveList`).pipe(
            map(dtos => dtos.map(dto => this.mapDtoToModel(dto)))
        );
    }

    addGeneric(generic: Omit<DrugGeneric, 'id' | 'createdAt'>): Observable<any> {
        const dto: GenericDto = {
            name: generic.name,
            indication: generic.indication,
            sideEffects: generic.sideEffects,
            isActive: generic.isActive
        };
        return this.api.post<any>(`${this.endpoint}/Create`, dto);
    }

    updateGeneric(generic: DrugGeneric & { encryptedId?: string }): Observable<any> {
        if (!generic.encryptedId) {
            throw new Error('EncryptedId is required for update');
        }
        const dto: GenericDto = {
            encryptedId: generic.encryptedId,
            name: generic.name,
            indication: generic.indication,
            sideEffects: generic.sideEffects,
            isActive: generic.isActive
        };
        return this.api.put<any>(`${this.endpoint}/Edit`, dto);
    }

    deleteGeneric(encryptedId: string): Observable<any> {
        return this.api.patch<any>(`${this.endpoint}/ChangeActive/${encryptedId}`, {});
    }

    private mapToModel(vm: GenericViewModel): DrugGeneric {
        return {
            id: vm.id,
            encryptedId: vm.encryptedId,
            name: vm.name,
            indication: vm.indication,
            sideEffects: vm.sideEffects,
            isActive: vm.isActive,
            createdAt: new Date()
        };
    }

    private mapDtoToModel(dto: GenericDto): DrugGeneric {
        return {
            id: dto.id || 0,
            encryptedId: dto.encryptedId,
            name: dto.name,
            indication: dto.indication,
            sideEffects: dto.sideEffects,
            isActive: dto.isActive,
            createdAt: new Date()
        };
    }
}
