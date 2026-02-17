import { Injectable, signal, inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService, PagedResponse, PaginationParams } from './api.service';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  divisionId?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DepartmentStatistics {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private api = inject(ApiService);

  private readonly endpoint = '/Department'; // Adjust based on actual backend endpoint
  
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  
  // Signals for reactive programming
  public departments = signal<Department[]>([]);
  public isLoading = signal(false);

  constructor() {
    // Subscribe to subject and update signal
    this.departmentsSubject.subscribe(departments => this.departments.set(departments));
  }

  /**
   * Get all departments with pagination
   */
  getDepartments(params: PaginationParams & { isActive?: boolean; divisionId?: string } = {}): Observable<PagedResponse<Department>> {
    this.isLoading.set(true);
    
    return this.api.getPaginated<any>(this.endpoint, params).pipe(
      map(response => {
        const mappedData = response.data.map((dept: any) => this.mapDepartmentDtoToDepartment(dept));
        return {
          ...response,
          data: mappedData
        };
      }),
      tap(response => {
        this.departmentsSubject.next(response.data);
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('Error loading departments:', error);
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get department by ID
   */
  getDepartmentById(id: string): Observable<Department> {
    return this.api.get<any>(`${this.endpoint}/${id}`).pipe(
      map(dept => this.mapDepartmentDtoToDepartment(dept))
    );
  }

  /**
   * Create a new department
   */
  createDepartment(department: {
    name: string;
    code?: string;
    description?: string;
    divisionId?: string;
    parentId?: string;
    isActive?: boolean;
  }): Observable<Department> {
    this.isLoading.set(true);
    
    return this.api.post<any>(this.endpoint, department).pipe(
      tap(newDepartment => {
        const mappedDepartment = this.mapDepartmentDtoToDepartment(newDepartment);
        const departments = this.departments();
        this.departmentsSubject.next([...departments, mappedDepartment]);
        this.isLoading.set(false);
      }),
      map(dept => this.mapDepartmentDtoToDepartment(dept)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing department
   */
  updateDepartment(id: string, department: {
    name?: string;
    code?: string;
    description?: string;
    divisionId?: string;
    parentId?: string;
    isActive?: boolean;
  }): Observable<Department> {
    this.isLoading.set(true);
    
    return this.api.put<any>(`${this.endpoint}/${id}`, department).pipe(
      tap(updatedDepartment => {
        const mappedDepartment = this.mapDepartmentDtoToDepartment(updatedDepartment);
        const departments = this.departments();
        const index = departments.findIndex(d => d.id === id);
        if (index !== -1) {
          departments[index] = mappedDepartment;
          this.departmentsSubject.next([...departments]);
        }
        this.isLoading.set(false);
      }),
      map(dept => this.mapDepartmentDtoToDepartment(dept)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a department
   */
  deleteDepartment(id: string): Observable<void> {
    this.isLoading.set(true);
    
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        const departments = this.departments().filter(d => d.id !== id);
        this.departmentsSubject.next(departments);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get department statistics (total, active, inactive)
   */
  getDepartmentStatistics(): Observable<DepartmentStatistics> {
    // Make parallel requests for all, active, and inactive departments
    return forkJoin({
      all: this.api.getPaginated<any>(this.endpoint, { page: 1, pageSize: 1 }).pipe(
        catchError(() => {
          // Fallback if statistics endpoint fails
          return this.getDepartments({ page: 1, pageSize: 1 });
        })
      ),
      active: this.api.getPaginated<any>(this.endpoint, { page: 1, pageSize: 1, isActive: true }).pipe(
        catchError(() => {
          // Fallback: filter active from all
          return this.getDepartments({ page: 1, pageSize: 1000, isActive: true }).pipe(
            map(response => ({ ...response, totalCount: response.data.filter((d: any) => d.isActive !== false).length }))
          );
        })
      ),
      inactive: this.api.getPaginated<any>(this.endpoint, { page: 1, pageSize: 1, isActive: false }).pipe(
        catchError(() => {
          // Fallback: filter inactive from all
          return this.getDepartments({ page: 1, pageSize: 1000, isActive: false }).pipe(
            map(response => ({ ...response, totalCount: response.data.filter((d: any) => d.isActive === false).length }))
          );
        })
      )
    }).pipe(
      map(results => ({
        totalDepartments: results.all.totalCount,
        activeDepartments: results.active.totalCount,
        inactiveDepartments: results.inactive.totalCount
      })),
      catchError(error => {
        console.error('Error loading department statistics:', error);
        // Return default values on error
        return throwError(() => error);
      })
    );
  }

  /**
   * Map backend Department DTO to frontend Department interface
   */
  private mapDepartmentDtoToDepartment(dto: any): Department {
    return {
      id: dto.id,
      name: dto.name,
      code: dto.code || undefined,
      description: dto.description || undefined,
      divisionId: dto.divisionId || undefined,
      parentId: dto.parentId || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
    };
  }
}

