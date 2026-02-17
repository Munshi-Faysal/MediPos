import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, finalize, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Paged Response interface matching backend PagedResponse<T>
 */
export interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Allow additional filter parameters
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  params?: any;
  headers?: HttpHeaders | Record<string, string | string[]>;
  responseType?: 'json' | 'blob' | 'text';
  reportProgress?: boolean;
  withCredentials?: boolean; // For cookie support
}

/**
 * Unified API Service for making HTTP requests
 * Works with both development and production environments
 * Handles authentication via interceptors (Bearer token)
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private readonly baseUrl: string;
  
  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error state management
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor() {
    // Use environment configuration
    // Note: Backend doesn't use /v1 in the route, so we use apiBaseUrl directly
    this.baseUrl = environment.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * GET paginated request
   * Returns PagedResponse matching backend format
   */
  getPaginated<T>(
    endpoint: string,
    paginationParams: PaginationParams = {},
    options?: ApiRequestOptions
  ): Observable<PagedResponse<T>> {
    const params = this.buildPaginationParams(paginationParams);
    
    return this.get<PagedResponse<T>>(endpoint, {
      ...options,
      params: { ...params, ...options?.params }
    });
  }

  /**
   * File upload
   */
  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    return this.post<T>(endpoint, formData);
  }

  /**
   * File download
   */
  download(endpoint: string, params?: any): Observable<Blob> {
    return this.get<Blob>(endpoint, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generic request method
   */
  private request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Observable<T> {
    this.setLoading(true);
    this.clearError();

    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(options?.params);
    const headers = this.buildHeaders(options?.headers);
    const responseType = options?.responseType || 'json';

    // When reportProgress is enabled, HttpClient returns Observable<HttpEvent<T>>
    // We need to handle this case separately with explicit types
    if (options?.reportProgress) {
      const requestOptionsWithProgress: {
        headers: HttpHeaders;
        params: HttpParams;
        responseType: any;
        reportProgress: true;
        withCredentials?: boolean;
      } = {
        headers,
        params: httpParams,
        responseType: responseType as any,
        reportProgress: true,
        withCredentials: options?.withCredentials ?? true // Default to true for cookie support
      };
      
      // Create a helper function to handle HttpEvent<T> to T conversion
      const processHttpEvent = (event$: Observable<HttpEvent<T>>): Observable<T> => {
        return event$.pipe(
          filter((event: HttpEvent<T>): event is HttpResponse<T> => event instanceof HttpResponse),
          map((event: HttpResponse<T>) => event.body as T),
          catchError((error: HttpErrorResponse) => this.handleError(error)),
          finalize(() => this.setLoading(false))
        );
      };
      
      // Handle each HTTP method with explicit type casting
      const upperMethod = method.toUpperCase();
      if (upperMethod === 'GET') {
        return processHttpEvent(this.http.get<T>(url, requestOptionsWithProgress) as Observable<HttpEvent<T>>);
      } else if (upperMethod === 'POST') {
        return processHttpEvent(this.http.post<T>(url, body, requestOptionsWithProgress) as Observable<HttpEvent<T>>);
      } else if (upperMethod === 'PUT') {
        return processHttpEvent(this.http.put<T>(url, body, requestOptionsWithProgress) as Observable<HttpEvent<T>>);
      } else if (upperMethod === 'PATCH') {
        return processHttpEvent(this.http.patch<T>(url, body, requestOptionsWithProgress) as Observable<HttpEvent<T>>);
      } else if (upperMethod === 'DELETE') {
        return processHttpEvent(this.http.delete<T>(url, requestOptionsWithProgress) as Observable<HttpEvent<T>>);
      } else {
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
      }
    }

    // Normal request without reportProgress - returns Observable<T>
    // Use explicit type to avoid HttpEvent<T> inference
    const requestOptions: { headers: HttpHeaders; params: HttpParams; responseType: any; withCredentials?: boolean } = {
      headers,
      params: httpParams,
      responseType: responseType as any,
      withCredentials: options?.withCredentials ?? true // Default to true for cookie support
    };

    let request$: Observable<T>;
    
    switch (method.toUpperCase()) {
      case 'GET':
        request$ = this.http.get<T>(url, requestOptions) as Observable<T>;
        break;
      case 'POST':
        request$ = this.http.post<T>(url, body, requestOptions) as Observable<T>;
        break;
      case 'PUT':
        request$ = this.http.put<T>(url, body, requestOptions) as Observable<T>;
        break;
      case 'PATCH':
        request$ = this.http.patch<T>(url, body, requestOptions) as Observable<T>;
        break;
      case 'DELETE':
        request$ = this.http.delete<T>(url, requestOptions) as Observable<T>;
        break;
      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }

    return request$.pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Build HttpParams from object
   */
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else if (typeof value === 'object') {
            httpParams = httpParams.append(key, JSON.stringify(value));
          } else {
            httpParams = httpParams.append(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  /**
   * Build pagination parameters for backend API
   */
  private buildPaginationParams(params: PaginationParams): any {
    const paginationParams: any = {};

    // Default to page 1 if not provided
    const page = params.page !== undefined && params.page !== null ? params.page : 1;
    paginationParams.page = page.toString();

    // Default to pageSize 10 if not provided
    const pageSize = params.pageSize !== undefined && params.pageSize !== null ? params.pageSize : 10;
    paginationParams.pageSize = pageSize.toString();

    if (params.search) {
      paginationParams.search = params.search;
    }

    if (params.sortBy) {
      paginationParams.sortBy = params.sortBy;
    }

    if (params.sortOrder) {
      paginationParams.sortOrder = params.sortOrder;
    }

    // Add any additional filter parameters
    Object.keys(params).forEach(key => {
      if (!['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          paginationParams[key] = value.toString();
        }
      }
    });

    return paginationParams;
  }

  /**
   * Build HttpHeaders
   */
  private buildHeaders(headers?: HttpHeaders | Record<string, string | string[]>): HttpHeaders {
    if (headers instanceof HttpHeaders) {
      return headers;
    }

    let httpHeaders = new HttpHeaders();

    if (headers) {
      Object.keys(headers).forEach(key => {
        const value = headers[key];
        if (Array.isArray(value)) {
          value.forEach(v => {
            httpHeaders = httpHeaders.append(key, v);
          });
        } else {
          httpHeaders = httpHeaders.set(key, value);
        }
      });
    }

    // Default content type for JSON (if not already set and not FormData)
    if (!httpHeaders.has('Content-Type')) {
      httpHeaders = httpHeaders.set('Content-Type', 'application/json');
    }

    return httpHeaders;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    this.setError(errorMessage);

    if (environment.enableLogging) {
      console.error('API Error:', {
        status: error.status,
        statusText: error.statusText,
        message: errorMessage,
        error: error.error
      });
    }

    return throwError(() => error);
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get current loading state
   */
  public getLoadingState(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get current error state
   */
  public getErrorState(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Get API base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Build full URL with query parameters (utility method)
   */
  public buildFullUrl(endpoint: string, params?: any): string {
    const url = this.buildUrl(endpoint);
    
    if (params) {
      const urlObj = new URL(url);
      const httpParams = this.buildHttpParams(params);
      httpParams.keys().forEach(key => {
        const values = httpParams.getAll(key);
        if (values) {
          values.forEach(value => {
            urlObj.searchParams.append(key, value);
          });
        }
      });
      return urlObj.toString();
    }

    return url;
  }
}

