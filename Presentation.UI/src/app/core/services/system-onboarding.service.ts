import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CompanyRegistration {
    id: number;
    organizationName: string;
    email: string;
    phone?: string;
    packageName: string;
    packageId: number;
    packagePrice: number;
    packageFeatures?: string;
    paymentStatus?: string;
    approvalStatus: string;
    rejectionReason?: string;
    billingCycleDate?: Date;
    approvedAt?: Date;
    approvedBy?: number;
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    userId?: number;
    createdDate: Date;
}

export interface ApprovalDto {
    id: number;
    billingCycleDate: string;
}

export interface RejectionDto {
    id: number;
    reason: string;
}

@Injectable({
    providedIn: 'root'
})
export class SystemOnboardingService {
    private apiService = inject(ApiService);

    private readonly baseUrl = '/Onboarding';

    getAllRegistrations(): Observable<CompanyRegistration[]> {
        return this.apiService.get<CompanyRegistration[]>(`${this.baseUrl}/registrations`);
    }

    getPendingRegistrations(): Observable<CompanyRegistration[]> {
        return this.apiService.get<CompanyRegistration[]>(`${this.baseUrl}/registrations/pending`);
    }

    getRegistrationById(id: number): Observable<CompanyRegistration> {
        return this.apiService.get<CompanyRegistration>(`${this.baseUrl}/registrations/${id}`);
    }

    approveRegistration(approval: ApprovalDto): Observable<any> {
        return this.apiService.post(`${this.baseUrl}/approve`, approval);
    }

    rejectRegistration(rejection: RejectionDto): Observable<any> {
        return this.apiService.post(`${this.baseUrl}/reject`, rejection);
    }
}
