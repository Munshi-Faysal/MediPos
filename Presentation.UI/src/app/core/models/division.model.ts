/**
 * Division models for Area Management
 */

export interface Division {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  branchCount: number;
  parentId?: string;
  children?: Division[];
}

export interface DivisionListItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  branchCount: number;
  parentId?: string;
}

export interface CreateDivisionRequest {
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  parentId?: string;
}

export interface UpdateDivisionRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

