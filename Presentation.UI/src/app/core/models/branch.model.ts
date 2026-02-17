/**
 * Branch models for Area Management
 */

export interface Branch {
  id: string;
  name: string;
  description?: string;
  code?: string;
  divisionId: string;
  divisionName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  subBranchCount: number;
}

export interface BranchListItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
  divisionId: string;
  divisionName?: string;
  isActive: boolean;
  createdAt: Date;
  subBranchCount: number;
}

export interface CreateBranchRequest {
  name: string;
  description?: string;
  code?: string;
  divisionId: string;
  isActive?: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

