import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, retry, timeout, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginationParams } from '../../core/models';

export interface ApiConfig {
  timeout?: number;
  retries?: number;
  headers?: HttpHeaders;
  withCredentials?: boolean;
}

export interface RequestOptions {
  params?: any;
  config?: ApiConfig;
}

@Injectable({
  providedIn: 'root'
})
export class UnitOfApiService {
  private http = inject(HttpClient);

  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly fullApiUrl: string;

  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error state management
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor() {
    this.baseUrl = environment.apiBaseUrl;
    this.apiVersion = environment.apiVersion;
    this.fullApiUrl = `${this.baseUrl}/${this.apiVersion}`;
  }

  // Generic HTTP methods
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(options?.params);
    const config = this.buildHttpConfig(options?.config);

    return this.http.get<ApiResponse<T>>(url, {
      params: httpParams,
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 30000),
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  post<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const config = this.buildHttpConfig(options?.config);

    return this.http.post<ApiResponse<T>>(url, data, {
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 30000),
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  put<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const config = this.buildHttpConfig(options?.config);

    return this.http.put<ApiResponse<T>>(url, data, {
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 30000),
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  patch<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const config = this.buildHttpConfig(options?.config);

    return this.http.patch<ApiResponse<T>>(url, data, {
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 30000),
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const config = this.buildHttpConfig(options?.config);

    return this.http.delete<ApiResponse<T>>(url, {
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 30000),
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  // File upload method
  upload<T>(endpoint: string, file: File, additionalData?: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const formData = new FormData();

    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const config = this.buildHttpConfig(options?.config);

    return this.http.post<ApiResponse<T>>(url, formData, {
      ...config,
      observe: 'response'
    }).pipe(
      timeout(options?.config?.timeout || 60000), // Longer timeout for uploads
      retry(options?.config?.retries || 0),
      filter((response): response is HttpResponse<ApiResponse<T>> => response instanceof HttpResponse),
      map((response: HttpResponse<ApiResponse<T>>) => this.extractData(response.body!)),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    );
  }

  // File download method
  download(endpoint: string, options?: RequestOptions): Observable<Blob> {
    this.setLoading(true);
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(options?.params);
    const config = this.buildHttpConfig(options?.config);

    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob',
      ...config
    }).pipe(
      timeout(options?.config?.timeout || 60000),
      retry(options?.config?.retries || 0),
      catchError(error => this.handleError(error)),
      tap(() => this.setLoading(false))
    ) as unknown as Observable<Blob>;
  }

  // Paginated requests
  getPaginated<T>(
    endpoint: string,
    paginationParams: PaginationParams,
    options?: RequestOptions
  ): Observable<{ data: T[]; total: number; page: number; pageSize: number }> {
    const params = {
      page: (paginationParams.page ?? 1).toString(),
      pageSize: (paginationParams.pageSize ?? 10).toString(),
      ...(paginationParams.sort && { sort: paginationParams.sort }),
      ...(paginationParams.order && { order: paginationParams.order }),
      ...(paginationParams.search && { search: paginationParams.search }),
      ...paginationParams.filters,
      ...options?.params
    };

    return this.get<{ data: T[]; total: number; page: number; pageSize: number }>(endpoint, {
      ...options,
      params
    });
  }

  // Search requests
  search<T>(endpoint: string, query: string, filters?: any, options?: RequestOptions): Observable<T[]> {
    const params = {
      search: query,
      ...filters,
      ...options?.params
    };

    return this.get<T[]>(endpoint, {
      ...options,
      params
    });
  }

  // Batch requests
  batch<T>(requests: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    data?: any;
    params?: any;
  }[], options?: RequestOptions): Observable<T[]> {
    const batchRequests = requests.map(req => ({
      method: req.method,
      url: this.buildUrl(req.endpoint),
      data: req.data,
      params: req.params
    }));

    return this.post<T[]>('/batch', { requests: batchRequests }, options);
  }

  // Health check
  healthCheck(): Observable<{ status: string; timestamp: string; version: string }> {
    return this.get<{ status: string; timestamp: string; version: string }>('/health');
  }

  // Utility methods
  private buildUrl(endpoint: string): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.fullApiUrl}${cleanEndpoint}`;
  }

  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.append(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  private buildHttpConfig(config?: ApiConfig): any {
    const httpConfig: any = {};

    if (config?.headers) {
      httpConfig.headers = config.headers;
    }

    if (config?.withCredentials !== undefined) {
      httpConfig.withCredentials = config.withCredentials;
    }

    return httpConfig;
  }

  private extractData<T>(response: ApiResponse<T>): T {
    if (response && response.success && response.data !== undefined) {
      return response.data;
    }

    // If response doesn't follow ApiResponse format, return as is
    return response as any;
  }

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
      console.error('API Error:', error);
    }

    return throwError(() => new Error(errorMessage));
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  // Public methods for external access to state
  public getLoadingState(): boolean {
    return this.loadingSubject.value;
  }

  public getErrorState(): string | null {
    return this.errorSubject.value;
  }

  public clearError(): void {
    this.errorSubject.next(null);
  }

  // URL building utility for external use
  public buildFullUrl(endpoint: string, params?: any): string {
    const url = this.buildUrl(endpoint);

    if (params) {
      const urlObj = new URL(url);
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          urlObj.searchParams.append(key, value.toString());
        }
      });
      return urlObj.toString();
    }

    return url;
  }

  // Get current API configuration
  public getApiConfig(): { baseUrl: string; version: string; fullUrl: string } {
    return {
      baseUrl: this.baseUrl,
      version: this.apiVersion,
      fullUrl: this.fullApiUrl
    };
  }
}
