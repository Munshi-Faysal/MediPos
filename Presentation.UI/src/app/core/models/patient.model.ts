export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  weight?: string;
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientFilters {
  name?: string;
  phone?: string;
  email?: string;
  search?: string;
}
