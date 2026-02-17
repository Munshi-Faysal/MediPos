import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import {
  Division,
  DivisionListItem,
  CreateDivisionRequest,
  UpdateDivisionRequest
} from '../models/division.model';

/**
 * Division Service for managing divisions
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class DivisionService {
  private api = inject(ApiService);

  private readonly endpoint = '/Division';

  /**
   * Get paginated list of divisions
   */
  getDivisions(params: PaginationParams & {
    isActive?: boolean;
    parentId?: string;
  } = {}): Observable<PagedResponse<DivisionListItem>> {
    return this.api.getPaginated<DivisionListItem>(this.endpoint, params);
  }

  /**
   * Get all active divisions (for dropdowns)
   */
  getActiveDivisions(parentId?: string, flatten = false): Observable<Division[]> {
    const params: any = {};
    if (parentId) {
      params.parentId = parentId;
    }
    if (flatten) {
      params.flatten = true;
    }
    return this.api.get<Division[]>(`${this.endpoint}/active`, { params });
  }

  /**
   * Get division by ID
   */
  getDivisionById(id: string): Observable<Division> {
    return this.api.get<Division>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new division
   */
  createDivision(division: CreateDivisionRequest): Observable<Division> {
    return this.api.post<Division>(this.endpoint, division);
  }

  /**
   * Update an existing division
   */
  updateDivision(id: string, division: UpdateDivisionRequest): Observable<Division> {
    return this.api.put<Division>(`${this.endpoint}/${id}`, division);
  }

  /**
   * Delete a division
   */
  deleteDivision(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a division
   */
  activateDivision(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a division
   */
  deactivateDivision(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Get division statistics (for header cards)
   * Fetches counts for total, active, and inactive divisions
   */
  getDivisionStatistics(): Observable<{
    totalDivisions: number;
    activeDivisions: number;
    inactiveDivisions: number;
  }> {
    // Fetch all divisions and filtered counts in parallel for accurate statistics
    const allParams = { page: 1, pageSize: 10000 };
    const activeParams = { page: 1, pageSize: 10000, isActive: true };
    const inactiveParams = { page: 1, pageSize: 10000, isActive: false };

    return new Observable(observer => {
      forkJoin({
        all: this.getDivisions(allParams),
        active: this.getDivisions(activeParams),
        inactive: this.getDivisions(inactiveParams)
      }).subscribe({
        next: (results) => {
          const statistics = {
            totalDivisions: results.all.totalCount,
            activeDivisions: results.active.totalCount,
            inactiveDivisions: results.inactive.totalCount
          };
          observer.next(statistics);
          observer.complete();
        },
        error: (error) => {
          // Fallback: try with just the all query
          this.getDivisions(allParams).subscribe({
            next: (response) => {
              const allDivisions = response.data;
              const statistics = {
                totalDivisions: response.totalCount,
                activeDivisions: allDivisions.filter(d => d.isActive).length,
                inactiveDivisions: allDivisions.filter(d => !d.isActive).length
              };
              observer.next(statistics);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }
}

