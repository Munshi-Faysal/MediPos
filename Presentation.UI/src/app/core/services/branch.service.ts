import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import {
  Branch,
  BranchListItem,
  CreateBranchRequest,
  UpdateBranchRequest
} from '../models/branch.model';

/**
 * Branch Service for managing branches
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private api = inject(ApiService);

  private readonly endpoint = '/Branch';

  /**
   * Get paginated list of branches
   */
  getBranches(params: PaginationParams & {
    isActive?: boolean;
    divisionId?: string;
  } = {}): Observable<PagedResponse<BranchListItem>> {
    return this.api.getPaginated<BranchListItem>(this.endpoint, params);
  }

  /**
   * Get all active branches (for dropdowns)
   */
  getActiveBranches(): Observable<Branch[]> {
    return this.api.get<Branch[]>(`${this.endpoint}/active`);
  }

  /**
   * Get branches by division ID
   */
  getBranchesByDivisionId(divisionId: string): Observable<Branch[]> {
    return this.api.get<Branch[]>(`${this.endpoint}/division/${divisionId}`);
  }

  /**
   * Get branch by ID
   */
  getBranchById(id: string): Observable<Branch> {
    return this.api.get<Branch>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new branch
   */
  createBranch(branch: CreateBranchRequest): Observable<Branch> {
    return this.api.post<Branch>(this.endpoint, branch);
  }

  /**
   * Update an existing branch
   */
  updateBranch(id: string, branch: UpdateBranchRequest): Observable<Branch> {
    return this.api.put<Branch>(`${this.endpoint}/${id}`, branch);
  }

  /**
   * Delete a branch
   */
  deleteBranch(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a branch
   */
  activateBranch(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a branch
   */
  deactivateBranch(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }
}

