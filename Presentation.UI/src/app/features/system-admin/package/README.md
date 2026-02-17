# Package Management Module

## Overview
This is a comprehensive single-page module for managing the Package Management System. It displays three interconnected tables in a beautiful, modern UI:

1. **Features** - Individual features that can be assigned to packages
2. **Packages** - Service plans with pricing and duration
3. **Package-Features** - Relationships linking packages to their included features

## Features

### 🎨 Modern UI Design
- **Gradient backgrounds** with glassmorphism effects
- **Three-column responsive layout** for desktop (stacks on mobile)
- **Color-coded sections**:
  - Features: Emerald/Teal gradient
  - Packages: Indigo/Purple gradient
  - Package-Features: Pink/Rose gradient
- **Smooth animations** and hover effects
- **Custom scrollbars** for each section

### ✨ Features Table (Left Column)
- **Create** new features with name, description, and active status
- **Edit** existing features
- **Toggle** active/inactive status
- **Visual cards** showing feature details
- Real-time search and filtering

### 📦 Packages Table (Middle Column)
- **Create** packages with:
  - Name and description
  - Price and duration (in days)
  - User limit (-1 for unlimited)
  - Popular badge option
  - Active/inactive status
  - Multiple feature assignments
- **Edit** existing packages
- **Toggle** active/inactive status
- **Visual cards** showing:
  - Price, duration, and user limits
  - Included features as tags
  - Popular badge for highlighted packages

### 🔗 Package-Features Table (Right Column)
- **Create** new package-feature relationships
- **View** all existing relationships with:
  - Package name
  - Feature name
  - Active status
- **Toggle** relationship status
- **Delete** relationships
- Visual flow showing package → feature connection

## Technical Details

### Component Location
```
Presentation.UI/src/app/features/system-admin/packages/packages-module.component.ts
```

### Route
```
/system-admin/packages
```

### Dependencies
- **SystemPackageService** - Provides mock data and CRUD operations
- **NotificationService** - Shows success/error notifications
- **Angular Forms** - Reactive forms for data entry
- **Angular Signals** - For reactive state management

### Data Models
```typescript
interface Feature {
  id: number;
  featureName: string;
  description?: string;
  isActive: boolean;
  createdDate: Date;
}

interface Package {
  id: number;
  packageName: string;
  description?: string;
  price: number;
  durationInDays: number;
  userLimit: number;
  isActive: boolean;
  isPopular: boolean;
  createdDate: Date;
  features?: Feature[];
}

interface PackageFeature {
  id: number;
  packageId: number;
  featureId: number;
  isActive: boolean;
}
```

## Usage

### Accessing the Module
1. Login as a System Admin
2. Navigate to `/system-admin/packages`
3. The page will load with all three tables displayed side-by-side

### Creating a Feature
1. Click "Add Feature" button in the Features section
2. Fill in the feature name and optional description
3. Toggle "Is Active" as needed
4. Click "Create Feature"

### Creating a Package
1. Click "Add Package" button in the Packages section
2. Fill in package details (name, price, duration, user limit)
3. Select features to include by checking boxes
4. Toggle "Popular" and "Is Active" as needed
5. Click "Create Package"

### Creating a Package-Feature Link
1. Click "Add Link" button in the Package-Features section
2. Select a package from the dropdown
3. Select a feature from the dropdown
4. Toggle "Is Active" as needed
5. Click "Create Link"

### Editing
- Click the "Edit" button on any feature or package card
- Modify the fields in the modal
- Click "Update" to save changes

### Toggling Status
- Click the "Activate/Deactivate" button on any item
- Status will update immediately with a notification

## Mock Data
The module uses mock data from `SystemPackageService`. The service includes:
- 6 pre-defined features (Medicine Management, Doctor Management, etc.)
- 3 pre-defined packages (Starter, Professional, Enterprise)
- 12 pre-defined package-feature relationships

All changes are stored in memory and will persist during the session but reset on page reload.

## Future Enhancements
When connecting to the backend API:
1. Replace `SystemPackageService` mock methods with HTTP calls
2. Add pagination for large datasets
3. Add advanced filtering and sorting
4. Add bulk operations (activate/deactivate multiple items)
5. Add export functionality (CSV, PDF)
6. Add audit logs for changes

## Styling
The component uses:
- **Tailwind CSS** utility classes
- **Custom animations** (fade-in, slide-up)
- **Custom scrollbar** styling
- **Gradient backgrounds** for visual appeal
- **Responsive design** that adapts to screen sizes

## Notes
- This is a **frontend-only mockup** - no backend integration
- All data is managed through the `SystemPackageService` mock service
- The component is **fully functional** with create, read, update operations
- **Delete** is only available for Package-Feature relationships
- The UI is designed to be **visually impressive** with modern web design principles
