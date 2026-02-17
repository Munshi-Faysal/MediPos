export enum MedicineForm {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  CREAM = 'Cream',
  OINTMENT = 'Ointment',
  DROP = 'Drop',
  SPRAY = 'Spray',
  POWDER = 'Powder',
  SUSPENSION = 'Suspension',
  CAPLET = 'Caplet',
  LOZENGE = 'Lozenge'
}

export interface DrugDetail {
  encryptedId: string;
  strengthName: string;
  drugTypeName: string;
  description?: string;
  unitPrice?: number;
}

export interface DrugMaster {
  encryptedId: string;
  name: string;
  drugCompanyName: string;
  drugGenericName: string;
  drugDetailList: DrugDetail[];
}

// Keep the old Medicine interface for compatibility if needed, 
// but we'll primarily use DrugMaster/DrugDetail for search now.
export interface Medicine {
  id: string;
  genericName: string;
  companyName: string;
  medicineName: string; // Brand name
  pack: string;
  variation: string; // Strength (e.g., 500mg)
  form: MedicineForm; // Tablet, Syrup, etc.
  price?: number;
  stockQuantity?: number;
  expiryDate?: Date;
  batchNumber?: string;
  manufacturerDetails?: string;
  category?: string;
  dose?: string;
  duration?: string;
  advice?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineFilters {
  genericName?: string;
  companyName?: string;
  medicineName?: string;
  form?: MedicineForm;
  category?: string;
  search?: string;
}
