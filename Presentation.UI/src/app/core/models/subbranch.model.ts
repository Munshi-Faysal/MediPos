/**
 * SubBranch models for Area Management
 */

export interface SubBranch {
  id: string;
  name: string;
  description?: string;
  code?: string;
  branchId: string;
  branchName?: string;
  divisionId: string;
  divisionName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SubBranchListItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
  branchId: string;
  branchName?: string;
  divisionId: string;
  divisionName?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateSubBranchRequest {
  name: string;
  description?: string;
  code?: string;
  branchId: string;
  isActive?: boolean;
}

export interface UpdateSubBranchRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

