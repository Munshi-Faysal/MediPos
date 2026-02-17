import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TreatmentTemplateDto, TreatmentTemplateViewModel, ApiResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class TreatmentService {
    private apiService = inject(ApiService);
    private readonly baseUrl = 'Treatment';

    getTemplatesByDoctor(doctorId: string): Observable<ApiResponse<TreatmentTemplateViewModel[]>> {
        return this.apiService.get<ApiResponse<TreatmentTemplateViewModel[]>>(`${this.baseUrl}/doctor/${doctorId}`);
    }

    getTemplatesByCurrentDoctor(): Observable<ApiResponse<TreatmentTemplateViewModel[]>> {
        return this.apiService.get<ApiResponse<TreatmentTemplateViewModel[]>>(`${this.baseUrl}/CurrentDoctor`);
    }

    getTemplateById(id: string): Observable<ApiResponse<TreatmentTemplateViewModel>> {
        return this.apiService.get<ApiResponse<TreatmentTemplateViewModel>>(`${this.baseUrl}/${id}`);
    }

    createTemplate(template: TreatmentTemplateDto): Observable<any> {
        return this.apiService.post(this.baseUrl, template);
    }

    updateTemplate(template: TreatmentTemplateDto): Observable<any> {
        return this.apiService.put(this.baseUrl, template);
    }

    deleteTemplate(id: string): Observable<any> {
        return this.apiService.delete(`${this.baseUrl}/${id}`);
    }
}
