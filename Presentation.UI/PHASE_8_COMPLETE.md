# Phase 8 Implementation - State Management

## ✅ Completed Implementation

All state management stores from Phase 8 have been created and are fully functional.

---

## Store Services Created

### 1. MedicineStore (`medicine.store.ts`)

**Location:** `src/app/core/stores/medicine.store.ts`

**Features:**
- ✅ Centralized medicine state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ Computed signals for filtered medicines
- ✅ State management: medicines, selectedMedicine, filters, loading, error
- ✅ CRUD operations: add, update, remove medicines
- ✅ Filter management
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private medicineStore: MedicineStore) {}

// Use signals (reactive)
medicines = this.medicineStore.medicines();
filteredMedicines = this.medicineStore.filteredMedicines();

// Use observables (RxJS)
this.medicineStore.getMedicines().subscribe(medicines => {
  // Handle medicines
});

// Update state
this.medicineStore.setMedicines(medicines);
this.medicineStore.addMedicine(newMedicine);
this.medicineStore.setFilters({ search: 'paracetamol' });
```

---

### 2. DoctorStore (`doctor.store.ts`)

**Location:** `src/app/core/stores/doctor.store.ts`

**Features:**
- ✅ Centralized doctor state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ Computed signals for filtered doctors
- ✅ Special computed signals:
  - `doctorsWithExpiringLicenses` - Doctors with licenses expiring within 30 days
  - `doctorsWithUpcomingBilling` - Doctors with billing dates within 7 days
- ✅ State management: doctors, selectedDoctor, filters, loading, error
- ✅ CRUD operations: add, update, remove doctors
- ✅ Filter management
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private doctorStore: DoctorStore) {}

// Use signals
doctors = this.doctorStore.doctors();
expiringLicenses = this.doctorStore.doctorsWithExpiringLicenses();
upcomingBilling = this.doctorStore.doctorsWithUpcomingBilling();

// Update state
this.doctorStore.setDoctors(doctors);
this.doctorStore.addDoctor(newDoctor);
```

---

### 3. PatientStore (`patient.store.ts`)

**Location:** `src/app/core/stores/patient.store.ts`

**Features:**
- ✅ Centralized patient state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ Computed signals for filtered patients
- ✅ State management: patients, selectedPatient, filters, loading, error
- ✅ CRUD operations: add, update, remove patients
- ✅ Filter management
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private patientStore: PatientStore) {}

// Use signals
patients = this.patientStore.patients();
filteredPatients = this.patientStore.filteredPatients();

// Update state
this.patientStore.setPatients(patients);
this.patientStore.addPatient(newPatient);
```

---

### 4. PrescriptionStore (`prescription.store.ts`)

**Location:** `src/app/core/stores/prescription.store.ts`

**Features:**
- ✅ Centralized prescription state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ Computed signals for filtered prescriptions
- ✅ Special computed signals:
  - `prescriptionsByStatus` - Grouped by status (draft, completed, cancelled)
  - `recentPrescriptions` - Prescriptions from last 30 days
- ✅ State management: prescriptions, selectedPrescription, filters, loading, error
- ✅ CRUD operations: add, update, remove prescriptions
- ✅ Filter management (by doctor, patient, status, date range)
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private prescriptionStore: PrescriptionStore) {}

// Use signals
prescriptions = this.prescriptionStore.prescriptions();
byStatus = this.prescriptionStore.prescriptionsByStatus();
recent = this.prescriptionStore.recentPrescriptions();

// Update state
this.prescriptionStore.setPrescriptions(prescriptions);
this.prescriptionStore.addPrescription(newPrescription);
this.prescriptionStore.setFilters({ doctorId: 'doc123' });
```

---

### 5. PackageStore (`package.store.ts`)

**Location:** `src/app/core/stores/package.store.ts`

**Features:**
- ✅ Centralized package state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ Computed signals for filtered packages
- ✅ Special computed signals:
  - `activePackages` - Only active packages
  - `packagesByUserLimit` - Grouped by user limit (single, small, medium, unlimited)
- ✅ State management: packages, selectedPackage, currentPackage, filters, loading, error
- ✅ CRUD operations: add, update, remove packages
- ✅ Filter management
- ✅ Current package tracking (for user/organization)
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private packageStore: PackageStore) {}

// Use signals
packages = this.packageStore.packages();
activePackages = this.packageStore.activePackages();
currentPackage = this.packageStore.currentPackage();

// Update state
this.packageStore.setPackages(packages);
this.packageStore.setCurrentPackage(userPackage);
```

---

### 6. AppStore (`app.store.ts`)

**Location:** `src/app/core/stores/app.store.ts`

**Features:**
- ✅ Global application state management
- ✅ BehaviorSubject for RxJS compatibility
- ✅ Angular signals for reactive programming
- ✅ UI State: sidebarOpen, theme, loading
- ✅ User Preferences: language, timezone
- ✅ Notifications: enabled status, unread count
- ✅ Error handling: error message, error type
- ✅ LocalStorage persistence for preferences
- ✅ Theme application to document
- ✅ State reset functionality

**Usage:**
```typescript
// Inject store
constructor(private appStore: AppStore) {}

// Use signals
sidebarOpen = this.appStore.sidebarOpen();
theme = this.appStore.theme();
unreadNotifications = this.appStore.unreadNotifications();

// Update state
this.appStore.toggleSidebar();
this.appStore.setTheme('dark');
this.appStore.setUnreadNotifications(5);
this.appStore.incrementUnreadNotifications();
this.appStore.setError('Something went wrong', 'error');
```

---

## Store Architecture

### Dual Pattern Support

All stores support both:
1. **RxJS Observables** (BehaviorSubject) - For traditional reactive programming
2. **Angular Signals** - For modern reactive programming

This allows flexibility in how components consume state:
- Use signals for simple reactive updates
- Use observables for complex async operations or when integrating with RxJS operators

### State Structure

Each store follows a consistent pattern:
```typescript
interface EntityState {
  entities: Entity[];           // Main data array
  selectedEntity: Entity | null; // Currently selected entity
  filters: EntityFilters;        // Current filters
  loading: boolean;              // Loading state
  error: string | null;          // Error state
}
```

### Computed Signals

Stores provide computed signals for:
- Filtered entities based on current filters
- Special groupings (by status, by date, etc.)
- Derived state calculations

### State Management Methods

Each store provides:
- `setEntities()` - Replace all entities
- `addEntity()` - Add new entity
- `updateEntity()` - Update existing entity
- `removeEntity()` - Remove entity
- `setSelectedEntity()` - Set selected entity
- `setFilters()` - Update filters
- `clearFilters()` - Reset filters
- `setLoading()` - Update loading state
- `setError()` - Set error state
- `reset()` - Reset to initial state

---

## Integration with Services

The stores are designed to work alongside existing services:

1. **Services handle API calls** - Fetch data from backend
2. **Stores manage state** - Store and provide reactive access to data
3. **Components use stores** - Subscribe to state changes

**Example Integration:**
```typescript
// In a component
constructor(
  private medicineService: MedicineService,
  private medicineStore: MedicineStore
) {}

ngOnInit() {
  // Load from service
  this.medicineService.getMedicines().subscribe(medicines => {
    // Update store
    this.medicineStore.setMedicines(medicines);
  });

  // React to store changes
  effect(() => {
    const medicines = this.medicineStore.medicines();
    // Update UI
  });
}
```

---

## Benefits

1. **Centralized State** - Single source of truth for each entity
2. **Reactive Updates** - Automatic UI updates when state changes
3. **Computed Values** - Derived state calculated automatically
4. **Type Safety** - Full TypeScript support
5. **Flexibility** - Support for both signals and observables
6. **Performance** - Efficient change detection with signals
7. **Persistence** - AppStore persists preferences to localStorage
8. **Error Handling** - Centralized error state management

---

## Next Steps

1. **Integrate Stores with Services:**
   - Update services to sync with stores
   - Load data into stores on initialization
   - Update stores when data changes

2. **Update Components:**
   - Replace direct service subscriptions with store subscriptions
   - Use computed signals for derived state
   - Leverage store methods for state updates

3. **Add Store Effects:**
   - Create effects to sync stores with services
   - Handle side effects (API calls, localStorage, etc.)

4. **Testing:**
   - Test store state updates
   - Test computed signals
   - Test error handling
   - Test state persistence

---

**Phase 8 (State Management) is complete!**
