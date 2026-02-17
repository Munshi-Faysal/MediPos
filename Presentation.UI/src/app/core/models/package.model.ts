export enum PackageStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export interface Package {
  id: string;
  packageName: string;
  description?: string;
  userLimit: number; // 1, 5, 15, or -1 for unlimited
  features: string[];
  price: number;
  status: PackageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageFilters {
  packageName?: string;
  status?: PackageStatus;
  userLimit?: number;
  search?: string;
}

export interface PackageFeatures {
  medicineManagement: boolean;
  doctorManagement: boolean;
  prescriptionMonitoring: boolean;
  patientManagement: boolean;
  reporting: boolean;
  analytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}
