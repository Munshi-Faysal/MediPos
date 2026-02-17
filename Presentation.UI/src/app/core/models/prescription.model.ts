import { Medicine } from './medicine.model';

export enum PrescriptionStatus {
  DRAFT = 'Draft',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface PrescriptionMedicine {
  id: string;
  medicineId: string;
  medicine?: Medicine; // Populated medicine details
  dosage: string; // e.g., "1 tablet"
  frequency: string; // e.g., "Twice daily"
  duration: string; // e.g., "7 days"
  instructions?: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  prescriptionDate: Date;

  // Clinical sections
  disease?: string;
  chiefComplaint?: string;
  onExamination?: string;
  investigation?: string;
  advice?: string;
  drugHistory?: string;
  diagnosis?: string;

  notes?: string;
  dynamicSections?: Record<string, string>;
  status: PrescriptionStatus;
  medicinesCount?: number;
  medicines: PrescriptionMedicine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionFilters {
  doctorId?: string;
  patientId?: string;
  status?: PrescriptionStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
