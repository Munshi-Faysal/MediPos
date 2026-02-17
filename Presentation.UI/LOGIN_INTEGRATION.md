# Login Backend Integration - Summary

## Changes Made

### 1. **Added Backend Response Interfaces** (`core/models/index.ts`)
- Added `BackendAuthResponseDto` interface matching backend structure
- Added `BackendUserDto` interface matching backend UserDto
- These interfaces help map backend responses to frontend format

### 2. **Updated AuthService** (`core/services/auth.service.ts`)
- ✅ Replaced `ApiClientService` with `ApiService` (unified API service)
- ✅ Updated `login()` method to call backend API at `/Auth/login`
- ✅ Added response mapping from `BackendAuthResponseDto` to `LoginResponse`
- ✅ Updated `logout()` method to call backend API at `/Auth/logout`
- ✅ Updated `refreshToken()` method to call backend API at `/Auth/refresh`
- ✅ Removed unused `API_URL` constant (now using environment config via ApiService)

### 3. **Updated Login Component** (`features/public/login/login.component.ts`)
- ✅ Replaced mock/demo login logic with real API call
- ✅ Uses `AuthService.login()` method
- ✅ Proper error handling with user-friendly messages
- ✅ Navigation based on user roles after successful login

### 4. **Backend API Endpoints Used**
- `POST /api/Auth/login` - Login with email/username and password
- `POST /api/Auth/logout` - Logout with refresh token
- `POST /api/Auth/refresh` - Refresh access token

## Backend vs Frontend Mapping

### Login Request
- **Frontend**: `{ userName: string, password: string }`
- **Backend**: `{ email: string, password: string }`
- **Solution**: Frontend sends `userName` as `email` field (backend accepts email or username via email field)

### Login Response
- **Backend**: `AuthResponseDto { accessToken, refreshToken, expiresAt, user: UserDto }`
- **Frontend**: `LoginResponse { token, refreshToken, expiresAt, user: User }`
- **Mapping**:
  - `accessToken` → `token`
  - `user` fields mapped (id, userName, email, firstName → userFName, etc.)

### User Mapping
- **Backend UserDto**: `{ id, email, userName, firstName, lastName, phoneNumber, ... }`
- **Frontend User**: `{ id, userName, email, userFName, userLName, mobile, ... }`
- **Mapping**:
  - `firstName` → `userFName`
  - `lastName` → `userLName`
  - `phoneNumber` → `mobile`
  - `profilePictureUrl` → `profileImageUrl`

## Error Handling

The login component now handles:
- ✅ Network errors (connection issues)
- ✅ Authentication errors (401 - Invalid credentials)
- ✅ Server errors (500, etc.)
- ✅ User-friendly error messages displayed to user

## Authentication Flow

1. User enters username/email and password
2. Frontend calls `AuthService.login()` with credentials
3. Service sends request to `/api/Auth/login` with email and password
4. Backend validates credentials and returns `AuthResponseDto`
5. Service maps backend response to frontend `LoginResponse`
6. Service stores tokens and user data in localStorage
7. Service updates authentication state (signals, BehaviorSubjects)
8. Component navigates user based on roles

## Token Storage

- Access token stored as `hrm_access_token`
- Refresh token stored as `hrm_refresh_token`
- User data stored as `hrm_user`
- Tokens used automatically by `AuthInterceptor` for API requests

## Testing

To test the login:
1. Ensure backend is running on the configured port
2. Ensure environment.ts has correct `apiBaseUrl`
3. Try logging in with a valid user from the database
4. Check browser console for any errors
5. Verify tokens are stored in localStorage
6. Verify navigation works correctly based on user roles

## Next Steps

- [ ] Test with real backend API
- [ ] Handle token refresh on 401 errors
- [ ] Add "Remember Me" functionality persistence
- [ ] Add forgot password functionality
- [ ] Add email verification flow

