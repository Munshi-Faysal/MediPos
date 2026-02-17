# Logout System Documentation

## Overview

The HRM application includes a comprehensive logout system that handles various logout scenarios including user-initiated logout, session timeouts, security-related logouts, and maintenance logouts.

## Components

### 1. AuthService (`auth.service.ts`)
Enhanced authentication service with improved logout functionality:

- `logout()`: Returns Observable for better error handling
- `logoutWithConfirmation()`: Shows confirmation dialog before logout
- `forceLogout()`: Immediate logout without server call
- `checkSessionTimeout()`: Checks if token is expired
- `getTokenExpirationTime()`: Returns minutes until token expires

### 2. LogoutService (`logout.service.ts`)
Centralized logout service with various logout options:

```typescript
interface LogoutOptions {
  showConfirmation?: boolean;
  redirectTo?: string;
  reason?: 'user-initiated' | 'session-expired' | 'security' | 'maintenance';
}
```

Methods:
- `logout(options)`: Main logout method with options
- `forceLogout(reason)`: Force logout for security/maintenance
- `logoutDueToSessionExpiry()`: Session timeout logout
- `logoutDueToSecurity()`: Security-related logout
- `logoutDueToMaintenance()`: Maintenance logout

### 3. SessionTimeoutService (`session-timeout.service.ts`)
Handles automatic session monitoring and timeout warnings:

- Monitors token expiration every minute
- Shows warning 5 minutes before expiry
- Automatically logs out when token expires
- Provides session extension functionality

### 4. LogoutUtilityService (`logout-utility.service.ts`)
Utility service for common logout operations with event tracking:

- `logoutWithConfirmation()`: Logout with confirmation and event tracking
- `quickLogout()`: Quick logout without confirmation
- `emergencyLogout()`: Emergency logout for security issues
- Event emission for logout tracking

### 5. LogoutButtonComponent (`logout-button.component.ts`)
Reusable logout button component with various configurations:

```typescript
// Usage examples
<app-logout-button
  type="danger"
  size="sm"
  text="Logout"
  requireConfirmation="true"
  (logoutCompleted)="onLogoutCompleted($event)"
></app-logout-button>
```

### 6. SessionTimeoutWarningComponent (`session-timeout-warning.component.ts`)
Warning component that appears when session is about to expire:

- Shows countdown timer
- Provides "Stay Logged In" and "Logout Now" options
- Visual progress bar indicating time remaining

### 7. LogoutConfirmationDialogComponent (`logout-confirmation-dialog.component.ts`)
Confirmation dialog for logout operations:

- Shows session information
- Displays token expiration time
- Confirmation/cancel options

## Guards and Interceptors

### 1. LogoutGuard (`logout.guard.ts`)
Route guard that checks authentication status and handles automatic logout:

- Verifies user authentication
- Checks token expiration
- Redirects to login on session expiry

### 2. LogoutInterceptor (`logout.interceptor.ts`)
HTTP interceptor that handles logout scenarios based on response status:

- 401 (Unauthorized): Session expiry logout
- 403 (Forbidden): Security logout
- 503 (Service Unavailable): Maintenance logout

## Usage Examples

### Basic Logout
```typescript
// In component
constructor(private logoutService: LogoutService) {}

logout() {
  this.logoutService.logout({
    showConfirmation: true,
    reason: 'user-initiated'
  }).subscribe(success => {
    if (success) {
      // Handle successful logout
    }
  });
}
```

### Emergency Logout
```typescript
// Security issue detected
this.logoutService.logoutDueToSecurity();
```

### Session Timeout Handling
```typescript
// In app component or main layout
constructor(private sessionTimeoutService: SessionTimeoutService) {}

// Service automatically monitors and handles timeouts
```

### Using Logout Button Component
```html
<app-logout-button
  type="danger"
  size="md"
  text="Sign Out"
  requireConfirmation="true"
  (logoutStarted)="onLogoutStarted()"
  (logoutCompleted)="onLogoutCompleted($event)"
  (logoutCancelled)="onLogoutCancelled()"
></app-logout-button>
```

## Configuration

### Session Timeout Settings
```typescript
// In session-timeout.service.ts
private warningThreshold = 5; // Show warning 5 minutes before expiry
private checkInterval = 60000; // Check every minute
```

### Logout Reasons
- `user-initiated`: User manually logged out
- `session-expired`: Token expired
- `security`: Security-related logout
- `maintenance`: System maintenance logout

## Security Features

1. **Token Validation**: Automatic token expiration checking
2. **Server-side Logout**: Revokes refresh tokens on server
3. **Local Data Cleanup**: Clears all local storage data
4. **Automatic Redirect**: Redirects to login page after logout
5. **Session Monitoring**: Continuous session health monitoring

## Error Handling

The logout system includes comprehensive error handling:

- Server logout failures don't prevent local cleanup
- Network errors are handled gracefully
- User is always redirected to login page
- Error events are tracked for debugging

## Testing

The logout system can be tested by:

1. Manual logout via UI
2. Token expiration simulation
3. Network error simulation
4. Security scenario testing

## Future Enhancements

1. **Analytics Integration**: Track logout events for analytics
2. **Multi-device Logout**: Logout from all devices
3. **Logout History**: Store logout history for audit
4. **Custom Logout Reasons**: Allow custom logout reasons
5. **Logout Scheduling**: Schedule logout for maintenance windows
