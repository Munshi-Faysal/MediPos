import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SystemAdminDashboardStats {
  pendingOnboarding: number;
  approvedBanks: number;
  rejectedBanks: number;
  totalBanks: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  type: 'approved' | 'pending' | 'rejected';
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiService = inject(ApiService);

  private readonly endpoint = '/Dashboard';

  getSystemAdminStats(): Observable<SystemAdminDashboardStats> {
    return this.apiService.get<SystemAdminDashboardStats>(`${this.endpoint}/SystemAdminStats`);
  }
}
