export enum DoctorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}

export interface Doctor {
  id: string;
  userId?: string; // Link to user account
  name: string;
  password?: string; // For creation/management
  licenseNumber: string;
  licenseExpiryDate: Date;
  billingDate: Date;
  email: string;
  phone: string;
  specialization?: string;
  address?: string;
  profileImage?: string;
  status: DoctorStatus;
  packageId?: string; // Made optional as per user request
  assignedPackageId?: string; // Alias for packageId
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorFilters {
  name?: string;
  licenseNumber?: string;
  status?: DoctorStatus;
  specialization?: string;
  search?: string;
}
