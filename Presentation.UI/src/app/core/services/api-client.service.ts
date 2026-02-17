import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse, PaginationParams } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient);

  private readonly API_URL = `${environment.apiBaseUrl}/${environment.apiVersion}`;

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.API_URL}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data?: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.API_URL}${endpoint}`, data);
  }

  put<T>(endpoint: string, data?: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.API_URL}${endpoint}`, data);
  }

  patch<T>(endpoint: string, data?: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.API_URL}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.API_URL}${endpoint}`);
  }

  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<T>>(`${this.API_URL}${endpoint}`, formData);
  }

  download(endpoint: string, params?: any): Observable<Blob> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get(`${this.API_URL}${endpoint}`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Paginated requests
  getPaginated<T>(
    endpoint: string, 
    paginationParams: PaginationParams
  ): Observable<ApiResponse<T>> {
    const params: any = {};
    
    // Add page with default
    if (paginationParams.page !== undefined && paginationParams.page !== null) {
      params.page = paginationParams.page.toString();
    } else {
      params.page = '1'; // Default to page 1
    }
    
    // Add pageSize with default
    if (paginationParams.pageSize !== undefined && paginationParams.pageSize !== null) {
      params.pageSize = paginationParams.pageSize.toString();
    } else {
      params.pageSize = '10'; // Default to 10 items per page
    }
    
    // Add optional parameters
    if (paginationParams.sort) {
      params.sort = paginationParams.sort;
    }
    if (paginationParams.order) {
      params.order = paginationParams.order;
    }
    if (paginationParams.search) {
      params.search = paginationParams.search;
    }
    if (paginationParams.filters) {
      Object.assign(params, paginationParams.filters);
    }

    return this.get<T>(endpoint, params);
  }

  // Search requests
  search<T>(endpoint: string, query: string, filters?: any): Observable<ApiResponse<T>> {
    const params = {
      search: query,
      ...filters
    };

    return this.get<T>(endpoint, params);
  }

  // Batch requests
  batch<T>(requests: { method: string; endpoint: string; data?: any }[]): Observable<ApiResponse<T>[]> {
    const batchRequests = requests.map(req => ({
      method: req.method.toUpperCase(),
      url: `${this.API_URL}${req.endpoint}`,
      data: req.data
    }));

    return this.post<ApiResponse<T>[]>('/batch', { requests: batchRequests }).pipe(
      map(response => response.data || [])
    );
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

  // Utility methods
  buildUrl(endpoint: string, params?: any): string {
    const url = new URL(`${this.API_URL}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    return url.toString();
  }

  // Health check
  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(`${this.API_URL}/health`);
  }
}

