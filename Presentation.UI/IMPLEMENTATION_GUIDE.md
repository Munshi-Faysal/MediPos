# Implementation Guide - Multivendor Prescription Management System

## Overview
This document provides a step-by-step implementation guide for building the multivendor prescription management software frontend.

---

## Phase 1: Project Structure Setup

### 1.1 Feature Modules Structure
```
src/app/features/
├── admin/
│   ├── package-management/
│   ├── medicine-management/
│   ├── doctor-management/
│   └── prescription-monitoring/
├── doctor/
│   ├── dashboard/
│   ├── prescription/
│   ├── patient/
│   └── profile/
└── shared/
    ├── components/
    ├── models/
    └── services/
```

### 1.2 Models to Create

#### Medicine Model
```typescript
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
  createdAt: Date;
  updatedAt: Date;
}

export enum MedicineForm {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  CREAM = 'Cream',
  OINTMENT = 'Ointment',
  DROP = 'Drop',
  SPRAY = 'Spray'
}
```

#### Doctor Model
```typescript
export interface Doctor {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiryDate: Date;
  billingDate: Date;
  email: string;
  phone: string;
  specialization?: string;
  address?: string;
  status: DoctorStatus;
  packageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DoctorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}
```

#### Patient Model
```typescript
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}
```

#### Prescription Model
```typescript
export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  prescriptionDate: Date;
  diagnosis?: string;
  notes?: string;
  status: PrescriptionStatus;
  medicines: PrescriptionMedicine[];
  createdAt: Date;
  updatedAt: Date;
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

export enum PrescriptionStatus {
  DRAFT = 'Draft',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}
```

#### Package Model
```typescript
export interface Package {
  id: string;
  packageName: string;
  userLimit: number; // 1, 5, 15, or -1 for unlimited
  features: string[];
  price: number;
  status: PackageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PackageStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}
```

---

## Phase 2: Service Layer

### 2.1 Medicine Service
```typescript
@Injectable({ providedIn: 'root' })
export class MedicineService {
  // CRUD operations
  getMedicines(): Observable<Medicine[]>
  getMedicineById(id: string): Observable<Medicine>
  createMedicine(medicine: Medicine): Observable<Medicine>
  updateMedicine(id: string, medicine: Medicine): Observable<Medicine>
  deleteMedicine(id: string): Observable<void>
  
  // Search and filter
  searchMedicines(query: string): Observable<Medicine[]>
  filterMedicines(filters: MedicineFilters): Observable<Medicine[]>
}
```

### 2.2 Doctor Service
```typescript
@Injectable({ providedIn: 'root' })
export class DoctorService {
  getDoctors(): Observable<Doctor[]>
  getDoctorById(id: string): Observable<Doctor>
  createDoctor(doctor: Doctor): Observable<Doctor>
  updateDoctor(id: string, doctor: Doctor): Observable<Doctor>
  deleteDoctor(id: string): Observable<void>
  
  // License and billing
  getDoctorsWithExpiringLicenses(days: number): Observable<Doctor[]>
  getDoctorsWithUpcomingBilling(days: number): Observable<Doctor[]>
}
```

### 2.3 Prescription Service
```typescript
@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  getPrescriptions(doctorId?: string): Observable<Prescription[]>
  getPrescriptionById(id: string): Observable<Prescription>
  createPrescription(prescription: Prescription): Observable<Prescription>
  updatePrescription(id: string, prescription: Prescription): Observable<Prescription>
  deletePrescription(id: string): Observable<void>
  
  // Filtering
  getPrescriptionsByDoctor(doctorId: string): Observable<Prescription[]>
  getPrescriptionsByDateRange(start: Date, end: Date): Observable<Prescription[]>
}
```

---

## Phase 3: Component Implementation Order

### Step 1: Medicine Management (Admin)
1. **Medicine List Component**
   - Display all medicines in a table
   - Search functionality
   - Filter by category, form, company
   - Pagination

2. **Medicine Form Component**
   - Add/Edit medicine
   - Form validation
   - All required fields

3. **Medicine Detail Component**
   - View medicine details
   - Edit/Delete actions

### Step 2: Doctor Management (Admin - Multi-user packages)
1. **Doctor List Component**
   - Display all doctors
   - License expiry warnings
   - Billing date tracking
   - Status indicators

2. **Doctor Form Component**
   - Add/Edit doctor
   - License validation
   - Date pickers for expiry and billing

3. **Doctor Detail Component**
   - View doctor details
   - View assigned prescriptions
   - License and billing information

### Step 3: Prescription Creation (Doctor)
1. **Prescription Form Component**
   - Patient selection/creation
   - Medicine search and selection
   - Dosage, frequency, duration inputs
   - Save and print functionality

2. **Medicine Search Component**
   - Search by generic name, brand, company
   - Filter by form, category
   - Quick add to prescription

### Step 4: Prescription Monitoring (Admin)
1. **Prescription List Component**
   - All prescriptions from assigned doctors
   - Filter by doctor, date range
   - Search functionality

2. **Prescription Detail Component**
   - View full prescription
   - Print/Export options

---

## Phase 4: Routing Structure

```typescript
// Admin Routes (for multi-user packages)
{
  path: 'admin',
  children: [
    { path: 'packages', component: PackageManagementComponent },
    { path: 'medicines', component: MedicineListComponent },
    { path: 'medicines/new', component: MedicineFormComponent },
    { path: 'medicines/:id', component: MedicineDetailComponent },
    { path: 'doctors', component: DoctorListComponent },
    { path: 'doctors/new', component: DoctorFormComponent },
    { path: 'doctors/:id', component: DoctorDetailComponent },
    { path: 'prescriptions', component: PrescriptionMonitoringComponent },
    { path: 'prescriptions/:id', component: PrescriptionDetailComponent }
  ]
}

// Doctor Routes
{
  path: 'doctor',
  children: [
    { path: 'dashboard', component: DoctorDashboardComponent },
    { path: 'prescriptions', component: PrescriptionListComponent },
    { path: 'prescriptions/new', component: PrescriptionFormComponent },
    { path: 'prescriptions/:id', component: PrescriptionDetailComponent },
    { path: 'patients', component: PatientListComponent },
    { path: 'patients/new', component: PatientFormComponent },
    { path: 'profile', component: DoctorProfileComponent }
  ]
}
```

---

## Phase 5: Guards and Permissions

### Package-based Guard
```typescript
@Injectable()
export class PackageGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userPackage = this.getUserPackage();
    const requiredUserLimit = route.data['minUsers'];
    
    if (requiredUserLimit === 1) {
      return userPackage.userLimit === 1;
    }
    return userPackage.userLimit >= requiredUserLimit || userPackage.userLimit === -1;
  }
}
```

### Role-based Guard
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userRole = this.getUserRole();
    return userRole === requiredRole;
  }
}
```

---

## Phase 6: Mock Data Structure

### Sample Medicine Data
```typescript
export const MOCK_MEDICINES: Medicine[] = [
  {
    id: '1',
    genericName: 'Paracetamol',
    companyName: 'Beximco Pharmaceuticals Ltd',
    medicineName: 'Napa',
    pack: '10 tablets',
    variation: '500 mg',
    form: MedicineForm.TABLET,
    price: 50,
    category: 'Analgesic'
  },
  // More samples...
];
```

---

## Phase 7: UI Components to Build

### Shared Components
1. **Data Table Component** - Reusable table with sorting, filtering
2. **Search Bar Component** - Generic search input
3. **Date Picker Component** - Custom date picker
4. **Medicine Card Component** - Display medicine in card format
5. **Prescription Print Component** - Print-friendly prescription view

### Admin Components
1. **Package Selector** - Package selection widget
2. **License Expiry Alert** - Warning for expiring licenses
3. **Billing Date Reminder** - Upcoming billing notifications

### Doctor Components
1. **Quick Prescription** - Fast prescription creation
2. **Patient Search** - Quick patient lookup
3. **Medicine Autocomplete** - Medicine search with autocomplete

---

## Phase 8: State Management

### Using Angular Services with BehaviorSubject
```typescript
@Injectable({ providedIn: 'root' })
export class MedicineStore {
  private medicines$ = new BehaviorSubject<Medicine[]>([]);
  
  getMedicines(): Observable<Medicine[]> {
    return this.medicines$.asObservable();
  }
  
  addMedicine(medicine: Medicine): void {
    const current = this.medicines$.value;
    this.medicines$.next([...current, medicine]);
  }
}
```

---

## Next Implementation Steps

Please provide the following details one by one:

1. **Medicine Management UI/UX**
   - Preferred table layout
   - Form design preferences
   - Search and filter UI

2. **Prescription Creation Flow**
   - Step-by-step UI flow
   - Medicine selection interface
   - Dosage input method

3. **Doctor Management Interface**
   - List view preferences
   - Form layout
   - License tracking display

4. **Dashboard Requirements**
   - Metrics to display
   - Chart types needed
   - Widget preferences

---

**Ready to start implementation once you provide the first set of requirements!**
