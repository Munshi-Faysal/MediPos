import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UnitOfApiService } from './unit-of-api.service';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}

export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hireDate: Date;
}

export interface EmployeeUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  position?: string;
  salary?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private unitOfApi = inject(UnitOfApiService);


  // Get all employees with pagination
  getEmployees(page = 1, pageSize = 10, search?: string): Observable<{ 
    data: Employee[]; 
    total: number; 
    page: number; 
    pageSize: number 
  }> {
    const params: any = { page, pageSize };
    if (search) {
      params.search = search;
    }

    return this.unitOfApi.getPaginated<Employee>('/employees', {
      page,
      pageSize,
      search,
      filters: {}
    });
  }

  // Get employee by ID
  getEmployeeById(id: string): Observable<Employee> {
    return this.unitOfApi.get<Employee>(`/employees/${id}`);
  }

  // Create new employee
  createEmployee(employee: EmployeeCreateRequest): Observable<Employee> {
    return this.unitOfApi.post<Employee>('/employees', employee);
  }

  // Update employee
  updateEmployee(id: string, employee: EmployeeUpdateRequest): Observable<Employee> {
    return this.unitOfApi.put<Employee>(`/employees/${id}`, employee);
  }

  // Delete employee
  deleteEmployee(id: string): Observable<void> {
    return this.unitOfApi.delete<void>(`/employees/${id}`);
  }

  // Search employees
  searchEmployees(query: string, department?: string): Observable<Employee[]> {
    const filters = department ? { department } : {};
    return this.unitOfApi.search<Employee>('/employees', query, filters);
  }

  // Upload employee photo
  uploadEmployeePhoto(employeeId: string, file: File): Observable<{ photoUrl: string }> {
    return this.unitOfApi.upload<{ photoUrl: string }>(
      `/employees/${employeeId}/photo`, 
      file
    );
  }

  // Download employee report
  downloadEmployeeReport(format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.unitOfApi.download('/employees/report', { params: { format } });
  }

  // Batch operations
  bulkUpdateEmployees(updates: { id: string; data: EmployeeUpdateRequest }[]): Observable<Employee[]> {
    const requests = updates.map(update => ({
      method: 'PUT' as const,
      endpoint: `/employees/${update.id}`,
      data: update.data
    }));

    return this.unitOfApi.batch<Employee>(requests);
  }

  // Get loading state
  get isLoading(): boolean {
    return this.unitOfApi.getLoadingState();
  }

  // Get error state
  get error(): string | null {
    return this.unitOfApi.getErrorState();
  }

  // Clear error
  clearError(): void {
    this.unitOfApi.clearError();
  }
}
