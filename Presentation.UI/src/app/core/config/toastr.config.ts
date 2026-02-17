// Toastr configuration wrapper
// NOTE: ngx-toastr is disabled because the package cannot be resolved by Vite/TypeScript
// The NotificationService uses SweetAlert2 as a fallback for toast notifications

import { InjectionToken } from '@angular/core';

// Create an injection token for ToastrService (not currently used)
export const TOASTR_SERVICE_TOKEN = new InjectionToken<any>('ToastrService');

export function getToastrProviders(): any[] {
  // Return empty array - toastr is disabled
  // SweetAlert2 is used as fallback in NotificationService
  return [];
}
