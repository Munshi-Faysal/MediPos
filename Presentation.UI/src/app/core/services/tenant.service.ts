import { Injectable, signal, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiClientService } from './api-client.service';

export interface TenantRegistration {
  id: string;
  companyName: string;
  legalName: string;
  domain: string;
  country: string;
  timezone: string;
  currency: string;
  logoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  branchCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  tenantCode: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  plan?: string;
  userCap?: number;
  featureFlags?: string[];
}

export interface RegistrationRequest {
  companyInfo: {
    companyName: string;
    legalName: string;
    domain: string;
    country: string;
    timezone: string;
    currency: string;
    logoUrl?: string;
    termsAccepted: boolean;
  };
  adminOwner: {
    fullName: string;
    workEmail: string;
    phone: string;
    nid: string;
    password: string;
    twoFactorEnabled: boolean;
  };
  branches: {
    count: number;
    names?: string[];
    locations?: string[];
  };
  consent: {
    marketing: boolean;
    dataProcessing: boolean;
    recaptchaToken: string;
  };
}

export interface RegistrationResponse {
  success: boolean;
  tenantCode: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TenantApprovalRequest {
  plan: string;
  userCap: number;
  featureFlags: string[];
}

export interface TenantRejectionRequest {
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiClient = inject(ApiClientService);

  private readonly TENANT_CODE_KEY = 'hrm_tenant_code';
  
  private tenantsSubject = new BehaviorSubject<TenantRegistration[]>([]);
  private currentTenantSubject = new BehaviorSubject<TenantRegistration | null>(null);
  
  // Signals for reactive programming
  public tenants = signal<TenantRegistration[]>([]);
  public currentTenant = signal<TenantRegistration | null>(null);
  public isLoading = signal(false);

  constructor() {
    this.tenantsSubject.subscribe(tenants => {
      this.tenants.set(tenants);
    });

    this.currentTenantSubject.subscribe(tenant => {
      this.currentTenant.set(tenant);
    });

    this.loadStoredTenantCode();
  }

  // Registration methods
  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    this.isLoading.set(true);
    
    return this.apiClient.post<RegistrationResponse>('/Tenant/registration', request)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        }),
        tap(response => {
          if (response.success) {
            this.storeTenantCode(response.tenantCode);
          }
          this.isLoading.set(false);
        })
      );
  }

  getRegistrationStatus(tenantCode: string): Observable<TenantRegistration> {
    return this.apiClient.get<TenantRegistration>(`/tenants/registration/${tenantCode}`)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        })
      );
  }

  // Admin methods
  getTenants(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    country?: string;
  }): Observable<{ data: TenantRegistration[]; total: number; page: number; pageSize: number }> {
    this.isLoading.set(true);
    
    return this.apiClient.get<{ data: TenantRegistration[]; total: number; page: number; pageSize: number }>(
      '/admin/tenants',
      params
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No data received from server');
        }
        return response.data;
      }),
      tap(response => {
        this.tenantsSubject.next(response.data);
        this.isLoading.set(false);
      })
    );
  }

  getTenantById(id: string): Observable<TenantRegistration> {
    return this.apiClient.get<TenantRegistration>(`/admin/tenants/${id}`)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        })
      );
  }

  approveTenant(id: string, approval: TenantApprovalRequest): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    
    return this.apiClient.post<{ success: boolean; message: string }>(
      `/admin/tenants/${id}/approve`,
      approval
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No data received from server');
        }
        return response.data;
      }),
      tap(response => {
        if (response.success) {
          this.refreshTenants();
        }
        this.isLoading.set(false);
      })
    );
  }

  rejectTenant(id: string, rejection: TenantRejectionRequest): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    
    return this.apiClient.post<{ success: boolean; message: string }>(
      `/admin/tenants/${id}/reject`,
      rejection
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No data received from server');
        }
        return response.data;
      }),
      tap(response => {
        if (response.success) {
          this.refreshTenants();
        }
        this.isLoading.set(false);
      })
    );
  }

  // Validation methods
  checkDomainAvailability(domain: string): Observable<{ available: boolean; message?: string }> {
    console.log('TenantService: checkDomainAvailability called with domain:', domain);
    // Always return domain as available for development/testing
    const result = { 
      available: true, 
      message: 'Domain is available' 
    };
    console.log('TenantService: returning result:', result);
    return of(result);
  }

  checkEmailAvailability(email: string): Observable<{ available: boolean; message?: string }> {
    // Always return email as available for development/testing
    return of({ 
      available: true, 
      message: 'Email is available' 
    });
  }

  // Utility methods
  getStoredTenantCode(): string | null {
    return localStorage.getItem(this.TENANT_CODE_KEY);
  }

  storeTenantCode(tenantCode: string): void {
    localStorage.setItem(this.TENANT_CODE_KEY, tenantCode);
  }

  clearTenantCode(): void {
    localStorage.removeItem(this.TENANT_CODE_KEY);
  }

  getCurrentTenantObservable(): Observable<TenantRegistration | null> {
    return this.currentTenantSubject.asObservable();
  }

  getTenantsObservable(): Observable<TenantRegistration[]> {
    return this.tenantsSubject.asObservable();
  }

  private loadStoredTenantCode(): void {
    const tenantCode = this.getStoredTenantCode();
    if (tenantCode) {
      // Add error handling to prevent unresponsive behavior
      this.getRegistrationStatus(tenantCode).subscribe({
        next: (tenant) => {
          this.currentTenantSubject.next(tenant);
        },
        error: (error) => {
          console.warn('Failed to load tenant status:', error);
          // Clear invalid tenant code
          this.clearTenantCode();
        }
      });
    }
  }

  private refreshTenants(): void {
    this.getTenants().subscribe();
  }

  // Multi-tenant support
  setCurrentTenant(tenant: TenantRegistration): void {
    this.currentTenantSubject.next(tenant);
    this.storeTenantCode(tenant.tenantCode);
  }

  getTenantByCode(tenantCode: string): Observable<TenantRegistration> {
    return this.apiClient.get<TenantRegistration>(`/tenants/by-code/${tenantCode}`)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        })
      );
  }

  // Onboarding methods
  getOnboardingStatus(tenantId: string): Observable<{
    completed: boolean;
    steps: {
      branches: boolean;
      orgUnits: boolean;
      grades: boolean;
      policies: boolean;
      payroll: boolean;
      leaveTypes: boolean;
      users: boolean;
    };
  }> {
    return this.apiClient.get<{
      completed: boolean;
      steps: {
        branches: boolean;
        orgUnits: boolean;
        grades: boolean;
        policies: boolean;
        payroll: boolean;
        leaveTypes: boolean;
        users: boolean;
      };
    }>(`/tenants/${tenantId}/onboarding`)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        })
      );
  }

  completeOnboardingStep(tenantId: string, step: string): Observable<{ success: boolean }> {
    return this.apiClient.post<{ success: boolean }>(
      `/tenants/${tenantId}/onboarding/${step}`,
      {}
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No data received from server');
        }
        return response.data;
      })
    );
  }
}
