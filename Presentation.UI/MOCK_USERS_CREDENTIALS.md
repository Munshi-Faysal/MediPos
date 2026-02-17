# Mock Users Credentials

This document contains the mock user credentials for testing the application without a backend connection.

## How to Use

1. Make sure `enableMockData: true` is set in `src/environments/environment.ts`
2. Use the credentials below to login
3. The mock authentication will work without connecting to the backend

## Mock Users

### 1. Admin User
- **Email/Username**: `admin@medipos.com` or `admin`
- **Password**: `Admin@123`
- **Role**: Admin, SystemAdmin
- **Name**: System Administrator
- **Access**: Full system access, manages doctors and medicines

### 2. Doctor User
- **Email/Username**: `doctor@medipos.com` or `doctor`
- **Password**: `Doctor@123`
- **Role**: Doctor
- **Name**: Dr. Ahmed Rahman
- **Access**: Creates prescriptions, manages patients

### 3. Organization User
- **Email/Username**: `organization@medipos.com` or `organization`
- **Password**: `Org@123`
- **Role**: Organization, Company
- **Name**: Medical Center
- **Access**: Company/tenant admin for multi-user packages

## Testing Instructions

1. Start the application: `npm start`
2. Navigate to the login page
3. Enter one of the credentials above
4. You should be logged in successfully and redirected based on your role

## Notes

- Mock authentication only works when `enableMockData: true` in environment.ts
- Mock tokens are generated locally and expire after 24 hours
- All mock users have active status and are ready to use
- To switch back to real backend authentication, set `enableMockData: false`

## User Details

### Admin User Details
- **ID**: 1
- **Email**: admin@medipos.com
- **Phone**: +880-1712-000001
- **Roles**: ['Admin', 'SystemAdmin']
- **Branch ID**: 1

### Doctor User Details
- **ID**: 2
- **Email**: doctor@medipos.com
- **Phone**: +880-1712-000002
- **Roles**: ['Doctor']
- **Branch ID**: 1

### Organization User Details
- **ID**: 3
- **Email**: organization@medipos.com
- **Phone**: +880-1712-000003
- **Roles**: ['Organization', 'Company']
- **Branch ID**: 1

## File Locations

- Mock users data: `src/app/core/data/mock-users.ts`
- Auth service: `src/app/core/services/auth.service.ts`
- Environment config: `src/environments/environment.ts`
