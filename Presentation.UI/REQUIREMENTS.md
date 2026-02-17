# Multivendor Prescription Management Software - Requirements Document

## System Overview
A SaaS-based multivendor prescription management system with frontend demo capabilities. The system supports multiple package types with different user limits and role-based access.

---

## 1. Package Types

The system supports 4 different package types based on user limits:

### 1.1 Single User Package (1 User)
- **Access Level**: Doctor Panel Only
- **Features**: 
  - Direct doctor access
  - Personal prescription management
  - No multi-user management features

### 1.2 Small Team Package (5 Users)
- **Access Level**: Admin Panel + Doctor Panels
- **Features**:
  - Admin can manage up to 5 users
  - Add/remove doctors
  - View assigned doctor prescriptions
  - Doctor management with license tracking

### 1.3 Medium Team Package (15 Users)
- **Access Level**: Admin Panel + Doctor Panels
- **Features**:
  - Admin can manage up to 15 users
  - All features from 5-user package
  - Enhanced reporting and analytics

### 1.4 Enterprise Package (Unlimited Users)
- **Access Level**: Admin Panel + Doctor Panels
- **Features**:
  - Unlimited user management
  - All features from previous packages
  - Advanced analytics and reporting
  - Priority support

---

## 2. Admin Panel Features

### 2.1 Package Management
- Create and configure packages
- Set user limits per package
- Configure package features and permissions

### 2.2 Medicine Management
The admin panel should allow adding medicines with the following attributes:

#### Medicine Attributes:
- **Generic Name** (e.g., Paracetamol)
- **Company Name** (e.g., Beximco Pharmaceuticals Ltd)
- **Medicine Name/Brand** (e.g., Napa)
- **Pack** (e.g., 10 tablets, 20 tablets, 50ml, 100ml)
- **Variation/Strength** (e.g., 500 mg, 250 mg, 1000 mg)
- **Form** (e.g., Tablet, Capsule, Syrup, Injection, Cream, Ointment)
- **Additional Attributes** (to be added as needed):
  - Price
  - Stock quantity
  - Expiry date
  - Batch number
  - Manufacturer details
  - Category/Type

#### Medicine Management Functions:
- Add new medicine
- Edit existing medicine
- Delete medicine
- Search and filter medicines
- Bulk import medicines
- Medicine categorization

### 2.3 Doctor Management (For Multi-User Packages)

#### Doctor Registration Fields:
- **Doctor Name**
- **License Number** (Required)
- **License Expiry Date** (Required)
- **Billing Date** (Required)
- **Email**
- **Phone Number**
- **Specialization**
- **Address**
- **Status** (Active/Inactive)

#### Doctor Management Functions:
- Add new doctor
- Edit doctor details
- Remove doctor
- View doctor list
- Search and filter doctors
- View assigned doctor's prescriptions
- License expiry notifications
- Billing date tracking

### 2.4 Prescription Monitoring (For Multi-User Packages)
- View all prescriptions from assigned doctors
- Filter prescriptions by doctor
- Filter prescriptions by date range
- View prescription details
- Export prescription reports
- Prescription analytics dashboard

---

## 3. Doctor Panel Features

### 3.1 Doctor Dashboard
- Overview of recent prescriptions
- Patient statistics
- Quick access to common functions

### 3.2 Prescription Creation
- Create new prescriptions
- Select patient (existing or new)
- Add medicines from medicine database
- Set dosage instructions
- Add notes/comments
- Save and print prescriptions

### 3.3 Patient Management
- Add new patients
- View patient history
- Search patients
- Patient profile management

### 3.4 Prescription History
- View own prescription history
- Search and filter prescriptions
- Print prescriptions
- Export prescriptions

---

## 4. User Roles & Permissions

### 4.1 Admin Role (Multi-User Packages)
- Full system access
- Manage doctors
- Manage medicines
- View all prescriptions
- System configuration
- User management

### 4.2 Doctor Role
- Create prescriptions
- Manage own patients
- View own prescription history
- Access medicine database (read-only)
- Update own profile

---

## 5. Database Structure (Proposed)

### 5.1 Medicine Table
```
- id
- generic_name
- company_name
- medicine_name (brand)
- pack
- variation (strength)
- form (tablet, syrup, etc.)
- price
- stock_quantity
- expiry_date
- batch_number
- manufacturer_details
- category
- created_at
- updated_at
```

### 5.2 Doctor Table
```
- id
- name
- license_number
- license_expiry_date
- billing_date
- email
- phone
- specialization
- address
- status
- package_id
- created_at
- updated_at
```

### 5.3 Patient Table
```
- id
- name
- age
- gender
- phone
- email
- address
- medical_history
- created_at
- updated_at
```

### 5.4 Prescription Table
```
- id
- doctor_id
- patient_id
- prescription_date
- diagnosis
- notes
- status
- created_at
- updated_at
```

### 5.5 Prescription Medicine Table
```
- id
- prescription_id
- medicine_id
- dosage
- frequency
- duration
- instructions
- quantity
- created_at
```

### 5.6 Package Table
```
- id
- package_name
- user_limit
- features
- price
- status
- created_at
- updated_at
```

---

## 6. UI/UX Requirements

### 6.1 Design Principles
- Clean and modern interface
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Fast loading times
- Accessible design

### 6.2 Key Pages/Screens

#### Admin Panel:
- Dashboard
- Package Management
- Medicine Management
- Doctor Management
- Prescription Monitoring
- Reports & Analytics
- Settings

#### Doctor Panel:
- Dashboard
- Create Prescription
- Patient Management
- Prescription History
- Medicine Search
- Profile Settings

---

## 7. Features to be Added (Incremental)

### Phase 1: Core Setup
- [ ] Package selection and configuration
- [ ] Basic admin panel structure
- [ ] Medicine management (CRUD operations)
- [ ] User authentication

### Phase 2: Doctor Management
- [ ] Doctor registration
- [ ] License tracking
- [ ] Billing date management
- [ ] Doctor assignment

### Phase 3: Prescription System
- [ ] Prescription creation
- [ ] Medicine selection from database
- [ ] Prescription templates
- [ ] Prescription printing

### Phase 4: Multi-User Features
- [ ] Admin prescription monitoring
- [ ] Doctor assignment management
- [ ] Prescription filtering and search
- [ ] Reports generation

### Phase 5: Advanced Features
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Notifications system
- [ ] Advanced reporting

---

## 8. Technical Stack (Suggested)

### Frontend:
- Angular (Current framework)
- Tailwind CSS (Current styling)
- TypeScript

### State Management:
- Angular Services
- RxJS for reactive programming

### Data Storage:
- Local storage for demo
- API integration ready for backend

---

## 9. Next Steps

Please provide the following information one by one:

1. **Medicine Management Details**
   - Additional medicine attributes needed
   - Medicine categories/classification
   - Search and filter requirements

2. **Prescription Creation Flow**
   - Step-by-step prescription creation process
   - Required fields for prescriptions
   - Dosage calculation logic

3. **Patient Management**
   - Patient registration fields
   - Patient history requirements
   - Patient search functionality

4. **Reporting & Analytics**
   - Required reports
   - Dashboard metrics
   - Export formats

5. **Additional Features**
   - Any other specific requirements
   - Integration requirements
   - Custom business rules

---

## Notes

- This is a frontend demo, so API endpoints can be mocked
- Focus on UI/UX and user flow
- Make it production-ready in terms of code structure
- Keep it scalable for future backend integration

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: In Progress
