import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../models/activity.model';

/**
 * Activity Service for managing activities
 * Uses the unified ApiService for all HTTP requests
 * Matches Workflow.Presentation.UI API structure
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private api = inject(ApiService);

  private readonly endpoint = '/Activity';

  /**
   * Get all activities from database (matching UI project API)
   * Calls /Activity/GetAll endpoint
   * Handles both direct array response and wrapped ViewResponseViewModel response
   */
  getAllActivities(): Observable<Activity[]> {
    return this.api.get<any>(`${this.endpoint}/GetAll`).pipe(
      map((response: any) => {
        // Handle wrapped response (ViewResponseViewModel)
        if (response?.data?.itemList) {
          return response.data.itemList;
        }
        // Handle direct array response
        if (Array.isArray(response)) {
          return response;
        }
        // Handle ViewResponseViewModel with Data.ItemList
        if (response?.data?.ItemList) {
          return response.data.ItemList;
        }
        return [];
      })
    );
  }

  /**
   * Get activity by encrypted ID (matching UI project API)
   * Calls /Activity/GetById/{encryptedId} endpoint
   */
  getActivityByEncryptedId(encryptedId: string): Observable<Activity> {
    return this.api.get<Activity>(`${this.endpoint}/GetById/${encryptedId}`);
  }

  /**
   * Create a new activity (matching UI project API)
   * Calls /Activity/Create endpoint
   */
  createActivity(activity: CreateActivityRequest): Observable<boolean> {
    return this.api.post<boolean>(`${this.endpoint}/Create`, activity);
  }

  /**
   * Update an existing activity (matching UI project API)
   * Calls /Activity/Edit endpoint
   */
  updateActivity(activity: UpdateActivityRequest): Observable<boolean> {
    return this.api.put<boolean>(`${this.endpoint}/Edit`, activity);
  }
}

