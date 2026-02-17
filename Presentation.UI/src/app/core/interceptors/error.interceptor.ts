import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, notificationService);
      return throwError(() => error);
    })
  );
};

function handleError(error: HttpErrorResponse, notificationService: NotificationService): void {
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = error.error.message;
    errorTitle = 'Client Error';
  } else {
    // Server-side error
    switch (error.status) {
      case 400:
        errorTitle = 'Bad Request';
        if (error.error?.errors) {
          errorMessage = formatValidationErrors(error.error.errors);
        } else {
          errorMessage = error.error?.message || 'Invalid request data';
        }
        break;
      case 401:
        errorTitle = 'Unauthorized';
        errorMessage = 'Please log in to continue';
        break;
      case 403:
        errorTitle = 'Forbidden';
        errorMessage = 'You do not have permission to perform this action';
        break;
      case 404:
        errorTitle = 'Not Found';
        errorMessage = 'The requested resource was not found';
        break;
      case 409:
        errorTitle = 'Conflict';
        errorMessage = error.error?.message || 'Resource conflict';
        break;
      case 422:
        errorTitle = 'Validation Error';
        errorMessage = formatValidationErrors(error.error?.errors);
        break;
      case 429:
        errorTitle = 'Too Many Requests';
        errorMessage = 'Please wait before making another request';
        break;
      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Internal server error. Please try again later';
        break;
      case 502:
        errorTitle = 'Bad Gateway';
        errorMessage = 'Service temporarily unavailable';
        break;
      case 503:
        errorTitle = 'Service Unavailable';
        errorMessage = 'Service is temporarily unavailable';
        break;
      case 504:
        errorTitle = 'Gateway Timeout';
        errorMessage = 'Request timeout. Please try again';
        break;
      default:
        errorTitle = `Error ${error.status}`;
        errorMessage = error.error?.message || error.message || 'An unexpected error occurred';
    }
  }

  // Show error notification
  notificationService.error(errorTitle, errorMessage, 8000);

  // Log error for debugging
  console.error('HTTP Error:', {
    status: error.status,
    statusText: error.statusText,
    url: error.url,
    message: errorMessage,
    error: error.error
  });
}

function formatValidationErrors(errors: any): string {
  if (!errors) return 'Validation failed';

  if (typeof errors === 'string') {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.join(', ');
  }

  if (typeof errors === 'object') {
    const errorMessages: string[] = [];
    Object.keys(errors).forEach(key => {
      const fieldErrors = errors[key];
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(`${key}: ${fieldErrors.join(', ')}`);
      } else {
        errorMessages.push(`${key}: ${fieldErrors}`);
      }
    });
    return errorMessages.join('; ');
  }

  return 'Validation failed';
}
