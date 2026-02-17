import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import {
  SubBranch,
  SubBranchListItem,
  CreateSubBranchRequest,
  UpdateSubBranchRequest
} from '../models/subbranch.model';

/**
 * SubBranch Service for managing sub-branches
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class SubBranchService {
  private api = inject(ApiService);

  private readonly endpoint = '/SubBranch';

  /**
   * Get paginated list of sub-branches
   */
  getSubBranches(params: PaginationParams & {
    isActive?: boolean;
    branchId?: string;
  } = {}): Observable<PagedResponse<SubBranchListItem>> {
    return this.api.getPaginated<SubBranchListItem>(this.endpoint, params);
  }

  /**
   * Get all active sub-branches (for dropdowns)
   */
  getActiveSubBranches(): Observable<SubBranch[]> {
    return this.api.get<SubBranch[]>(`${this.endpoint}/active`);
  }

  /**
   * Get sub-branches by branch ID
   */
  getSubBranchesByBranchId(branchId: string): Observable<SubBranch[]> {
    return this.api.get<SubBranch[]>(`${this.endpoint}/branch/${branchId}`);
  }

  /**
   * Get sub-branch by ID
   */
  getSubBranchById(id: string): Observable<SubBranch> {
    return this.api.get<SubBranch>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new sub-branch
   */
  createSubBranch(subBranch: CreateSubBranchRequest): Observable<SubBranch> {
    return this.api.post<SubBranch>(this.endpoint, subBranch);
  }

  /**
   * Update an existing sub-branch
   */
  updateSubBranch(id: string, subBranch: UpdateSubBranchRequest): Observable<SubBranch> {
    return this.api.put<SubBranch>(`${this.endpoint}/${id}`, subBranch);
  }

  /**
   * Delete a sub-branch
   */
  deleteSubBranch(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a sub-branch
   */
  activateSubBranch(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a sub-branch
   */
  deactivateSubBranch(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }
}

