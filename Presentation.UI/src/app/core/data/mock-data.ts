import { Medicine, MedicineForm } from '../models/medicine.model';
import { Doctor, DoctorStatus } from '../models/doctor.model';
import { Patient, Gender } from '../models/patient.model';
import { Prescription, PrescriptionStatus, PrescriptionMedicine } from '../models/prescription.model';
import { Package, PackageStatus } from '../models/package.model';

/**
 * Mock Data for Prescription Management System
 * This file contains sample data for demo/testing purposes
 */

// Mock Medicines
export const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'med_1',
    genericName: 'Paracetamol',
    companyName: 'Beximco Pharmaceuticals Ltd',
    medicineName: 'Napa',
    pack: '10 tablets',
    variation: '500 mg',
    form: MedicineForm.TABLET,
    price: 50,
    stockQuantity: 1000,
    expiryDate: new Date('2025-12-31'),
    batchNumber: 'BEX-2024-001',
    manufacturerDetails: 'Beximco Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Analgesic',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'med_2',
    genericName: 'Paracetamol',
    companyName: 'Square Pharmaceuticals Ltd',
    medicineName: 'Ace',
    pack: '20 tablets',
    variation: '500 mg',
    form: MedicineForm.TABLET,
    price: 45,
    stockQuantity: 800,
    expiryDate: new Date('2025-11-30'),
    batchNumber: 'SQ-2024-002',
    manufacturerDetails: 'Square Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Analgesic',
    isActive: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'med_3',
    genericName: 'Amoxicillin',
    companyName: 'Beximco Pharmaceuticals Ltd',
    medicineName: 'Beximox',
    pack: '10 capsules',
    variation: '500 mg',
    form: MedicineForm.CAPSULE,
    price: 120,
    stockQuantity: 500,
    expiryDate: new Date('2025-10-15'),
    batchNumber: 'BEX-2024-003',
    manufacturerDetails: 'Beximco Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antibiotic',
    isActive: true,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'med_4',
    genericName: 'Omeprazole',
    companyName: 'Square Pharmaceuticals Ltd',
    medicineName: 'Omez',
    pack: '14 capsules',
    variation: '20 mg',
    form: MedicineForm.CAPSULE,
    price: 150,
    stockQuantity: 600,
    expiryDate: new Date('2025-09-20'),
    batchNumber: 'SQ-2024-004',
    manufacturerDetails: 'Square Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antacid',
    isActive: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'med_5',
    genericName: 'Cetirizine',
    companyName: 'Incepta Pharmaceuticals Ltd',
    medicineName: 'Alatrol',
    pack: '10 tablets',
    variation: '10 mg',
    form: MedicineForm.TABLET,
    price: 40,
    stockQuantity: 900,
    expiryDate: new Date('2025-08-25'),
    batchNumber: 'INC-2024-005',
    manufacturerDetails: 'Incepta Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antihistamine',
    isActive: true,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'med_6',
    genericName: 'Salbutamol',
    companyName: 'Beximco Pharmaceuticals Ltd',
    medicineName: 'Bexovent',
    pack: '100ml',
    variation: '2 mg/5ml',
    form: MedicineForm.SYRUP,
    price: 180,
    stockQuantity: 300,
    expiryDate: new Date('2025-07-30'),
    batchNumber: 'BEX-2024-006',
    manufacturerDetails: 'Beximco Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Bronchodilator',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'med_7',
    genericName: 'Metformin',
    companyName: 'Square Pharmaceuticals Ltd',
    medicineName: 'Metfor',
    pack: '30 tablets',
    variation: '500 mg',
    form: MedicineForm.TABLET,
    price: 80,
    stockQuantity: 700,
    expiryDate: new Date('2025-06-15'),
    batchNumber: 'SQ-2024-007',
    manufacturerDetails: 'Square Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antidiabetic',
    isActive: true,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'med_8',
    genericName: 'Amlodipine',
    companyName: 'Beximco Pharmaceuticals Ltd',
    medicineName: 'Bexamil',
    pack: '30 tablets',
    variation: '5 mg',
    form: MedicineForm.TABLET,
    price: 100,
    stockQuantity: 550,
    expiryDate: new Date('2025-05-20'),
    batchNumber: 'BEX-2024-008',
    manufacturerDetails: 'Beximco Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antihypertensive',
    isActive: true,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'med_9',
    genericName: 'Ibuprofen',
    companyName: 'Square Pharmaceuticals Ltd',
    medicineName: 'Ibu',
    pack: '20 tablets',
    variation: '400 mg',
    form: MedicineForm.TABLET,
    price: 60,
    stockQuantity: 850,
    expiryDate: new Date('2025-04-25'),
    batchNumber: 'SQ-2024-009',
    manufacturerDetails: 'Square Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'NSAID',
    isActive: true,
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'med_10',
    genericName: 'Ciprofloxacin',
    companyName: 'Incepta Pharmaceuticals Ltd',
    medicineName: 'Cipro',
    pack: '10 tablets',
    variation: '500 mg',
    form: MedicineForm.TABLET,
    price: 140,
    stockQuantity: 400,
    expiryDate: new Date('2025-03-30'),
    batchNumber: 'INC-2024-010',
    manufacturerDetails: 'Incepta Pharmaceuticals Ltd, Dhaka, Bangladesh',
    category: 'Antibiotic',
    isActive: true,
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24')
  }
];

// Mock Doctors
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc_1',
    userId: 'user_1',
    name: 'Dr. Ahmed Rahman',
    password: 'Password123!',
    licenseNumber: 'BMDC-12345',
    licenseExpiryDate: new Date('2025-12-31'),
    billingDate: new Date('2024-02-15'),
    email: 'ahmed.rahman@example.com',
    phone: '+880-1712-345678',
    specialization: 'General Medicine',
    address: '123 Medical Street, Dhaka',
    status: DoctorStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'doc_2',
    userId: 'user_2',
    name: 'Dr. Fatima Khan',
    password: 'Password123!',
    licenseNumber: 'BMDC-12346',
    licenseExpiryDate: new Date('2024-11-30'), // Expiring soon
    billingDate: new Date('2024-02-20'),
    email: 'fatima.khan@example.com',
    phone: '+880-1712-345679',
    specialization: 'Cardiology',
    address: '456 Heart Avenue, Dhaka',
    status: DoctorStatus.ACTIVE,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'doc_3',
    userId: 'user_3',
    name: 'Dr. Mohammad Ali',
    password: 'Password123!',
    licenseNumber: 'BMDC-12347',
    licenseExpiryDate: new Date('2026-01-15'),
    billingDate: new Date('2024-02-10'), // Billing soon
    email: 'mohammad.ali@example.com',
    phone: '+880-1712-345680',
    specialization: 'Pediatrics',
    address: '789 Child Care Road, Dhaka',
    status: DoctorStatus.ACTIVE,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: 'doc_4',
    userId: 'user_4',
    name: 'Dr. Ayesha Begum',
    password: 'Password123!',
    licenseNumber: 'BMDC-12348',
    licenseExpiryDate: new Date('2025-08-20'),
    billingDate: new Date('2024-03-01'),
    email: 'ayesha.begum@example.com',
    phone: '+880-1712-345681',
    specialization: 'Dermatology',
    address: '321 Skin Care Lane, Dhaka',
    status: DoctorStatus.ACTIVE,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: 'doc_5',
    userId: 'user_5',
    name: 'Dr. Hasan Mahmud',
    password: 'Password123!',
    licenseNumber: 'BMDC-12349',
    licenseExpiryDate: new Date('2025-06-30'),
    billingDate: new Date('2024-03-15'),
    email: 'hasan.mahmud@example.com',
    phone: '+880-1712-345682',
    specialization: 'Orthopedics',
    address: '654 Bone Street, Dhaka',
    status: DoctorStatus.INACTIVE,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// Mock Patients
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    name: 'Rashidul Islam',
    age: 45,
    gender: Gender.MALE,
    phone: '+880-1711-234567',
    email: 'rashidul.islam@example.com',
    address: '123 Main Street, Dhaka',
    medicalHistory: 'Hypertension, Diabetes',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'pat_2',
    name: 'Nusrat Jahan',
    age: 32,
    gender: Gender.FEMALE,
    phone: '+880-1711-234568',
    email: 'nusrat.jahan@example.com',
    address: '456 Park Avenue, Dhaka',
    medicalHistory: 'Asthma',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'pat_3',
    name: 'Karim Uddin',
    age: 28,
    gender: Gender.MALE,
    phone: '+880-1711-234569',
    email: 'karim.uddin@example.com',
    address: '789 Garden Road, Dhaka',
    medicalHistory: 'None',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'pat_4',
    name: 'Sultana Begum',
    age: 55,
    gender: Gender.FEMALE,
    phone: '+880-1711-234570',
    email: 'sultana.begum@example.com',
    address: '321 Hill Street, Dhaka',
    medicalHistory: 'Arthritis, Hypertension',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'pat_5',
    name: 'Tareq Hasan',
    age: 12,
    gender: Gender.MALE,
    phone: '+880-1711-234571',
    address: '654 School Lane, Dhaka',
    medicalHistory: 'Allergies',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  }
];

// Mock Prescriptions
export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pres_1',
    doctorId: 'doc_1',
    patientId: 'pat_1',
    prescriptionDate: new Date('2024-01-20'),
    diagnosis: 'Hypertension and Type 2 Diabetes',
    notes: 'Patient should monitor blood pressure daily',
    status: PrescriptionStatus.COMPLETED,
    medicines: [
      {
        id: 'pres_med_1',
        medicineId: 'med_8',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food',
        quantity: 30
      },
      {
        id: 'pres_med_2',
        medicineId: 'med_7',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        instructions: 'Take with meals',
        quantity: 60
      }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'pres_2',
    doctorId: 'doc_2',
    patientId: 'pat_2',
    prescriptionDate: new Date('2024-01-21'),
    diagnosis: 'Acute Asthma Attack',
    notes: 'Use inhaler as needed',
    status: PrescriptionStatus.COMPLETED,
    medicines: [
      {
        id: 'pres_med_3',
        medicineId: 'med_6',
        dosage: '10ml',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Shake well before use',
        quantity: 1
      },
      {
        id: 'pres_med_4',
        medicineId: 'med_5',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '7 days',
        instructions: 'Take at bedtime',
        quantity: 7
      }
    ],
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'pres_3',
    doctorId: 'doc_1',
    patientId: 'pat_3',
    prescriptionDate: new Date('2024-01-22'),
    diagnosis: 'Common Cold',
    notes: 'Rest and drink plenty of fluids',
    status: PrescriptionStatus.DRAFT,
    medicines: [
      {
        id: 'pres_med_5',
        medicineId: 'med_1',
        dosage: '1 tablet',
        frequency: 'Every 6 hours',
        duration: '5 days',
        instructions: 'Take after meals',
        quantity: 20
      },
      {
        id: 'pres_med_6',
        medicineId: 'med_5',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '5 days',
        instructions: 'Take at night',
        quantity: 5
      }
    ],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'pres_4',
    doctorId: 'doc_3',
    patientId: 'pat_5',
    prescriptionDate: new Date('2024-01-23'),
    diagnosis: 'Allergic Rhinitis',
    notes: 'Avoid allergens',
    status: PrescriptionStatus.COMPLETED,
    medicines: [
      {
        id: 'pres_med_7',
        medicineId: 'med_5',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '10 days',
        instructions: 'Take in the morning',
        quantity: 10
      }
    ],
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'pres_5',
    doctorId: 'doc_4',
    patientId: 'pat_4',
    prescriptionDate: new Date('2024-01-24'),
    diagnosis: 'Skin Infection',
    notes: 'Keep area clean and dry',
    status: PrescriptionStatus.COMPLETED,
    medicines: [
      {
        id: 'pres_med_8',
        medicineId: 'med_3',
        dosage: '1 capsule',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food',
        quantity: 21
      }
    ],
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24')
  }
];

// Mock Packages (already defined in package.service.ts, but included here for reference)
export const MOCK_PACKAGES: Package[] = [
  {
    id: 'pkg_1',
    packageName: 'Single User Package',
    userLimit: 1,
    features: [
      'prescription_creation',
      'patient_management',
      'medicine_search'
    ],
    price: 29.99,
    status: PackageStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'pkg_5',
    packageName: 'Small Team Package',
    userLimit: 5,
    features: [
      'medicine_management',
      'doctor_management',
      'prescription_creation',
      'prescription_monitoring',
      'patient_management'
    ],
    price: 79.99,
    status: PackageStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'pkg_15',
    packageName: 'Medium Team Package',
    userLimit: 15,
    features: [
      'medicine_management',
      'doctor_management',
      'prescription_creation',
      'prescription_monitoring',
      'patient_management',
      'reporting',
      'analytics'
    ],
    price: 199.99,
    status: PackageStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'pkg_unlimited',
    packageName: 'Enterprise Package',
    userLimit: -1, // Unlimited
    features: [
      'medicine_management',
      'doctor_management',
      'prescription_creation',
      'prescription_monitoring',
      'patient_management',
      'reporting',
      'analytics',
      'api_access',
      'priority_support'
    ],
    price: 499.99,
    status: PackageStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];
