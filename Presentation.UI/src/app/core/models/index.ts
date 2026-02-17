export interface User {
  id: string;
  userName: string;
  email: string;
  userFName?: string;
  userLName?: string;
  mobile?: string;
  profileImageUrl?: string;
  isActive: boolean;
  roles: string[];
  branchId?: string;
  doctorId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginRequest {
  userName: string; // Frontend field - can be email or username
  password: string;
  rememberMe?: boolean;
}

// Login DTOs matching Workflow.Presentation.UI structure
export interface LoginDto {
  usernameEmail: string;
  password: string;
  otp?: string;
  deviceId: string; // Required - must be a valid GUID/UUID
  trustDevice?: boolean;
}

export interface LoginOtpDto {
  userId: number;
  deviceId?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  otp: number;
}

export interface IdentityResult {
  succeeded: boolean;
  errors?: string[];
}

export interface LoginResponseDto {
  result: IdentityResult;
  token?: string;
  userId?: number;
  doctorId?: number;
  is2FaRequired: boolean;
  isMailConfirmed: boolean;
}

// Backend AuthResponseDto structure
export interface BackendAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  user: BackendUserDto;
}

export interface BackendUserDto {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  profilePictureUrl?: string;
  createdAt: string; // ISO date string
  roles: string[];
  doctorId?: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  [key: string]: any; // Allow additional filter parameters
}

/**
 * Paged Response interface matching backend PagedResponse<T>
 */
export interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedList<T> {
  itemList: T[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'list' | 'calendar';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config?: any;
}

// Export role models
export * from './role.model';

// Export menu models
export * from './menu.model';

// Export menu action models
export * from './menu-action.model';

// Export division models
export * from './division.model';

// Export branch models
export * from './branch.model';

// Export subbranch models
export * from './subbranch.model';

// Export prescription management models
export * from './medicine.model';
export * from './doctor.model';
export * from './patient.model';
export * from './prescription.model';
export * from './package.model';
export * from './treatment.model';


