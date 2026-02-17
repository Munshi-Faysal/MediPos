import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, retry } from 'rxjs/operators';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval' | 'payroll' | 'finance' | 'chat' | 'system';
  category: NotificationCategory;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  isPinned: boolean;
  isMuted: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionData?: any;
  metadata?: any;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  digestFrequency: 'off' | 'hourly' | 'daily' | 'weekly';
  moduleSettings: Record<string, {
      enabled: boolean;
      channels: {
        inApp: boolean;
        email: boolean;
        sms: boolean;
        push: boolean;
      };
      granularity: 'all' | 'assigned-to-me' | 'my-team' | 'none';
    }>;
  soundEnabled: boolean;
  desktopPushEnabled: boolean;
}

export interface NotificationStats {
  totalUnread: number;
  totalToday: number;
  totalThisWeek: number;
  categoryBreakdown: Record<string, number>;
  lastUpdated: Date;
}

export interface NotificationAction {
  id: string;
  notificationId: string;
  actionType: 'approve' | 'reject' | 'view' | 'dismiss' | 'mute' | 'pin';
  actionData?: any;
  performedAt: Date;
  performedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  private readonly STORAGE_KEY = 'notification_preferences';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private preferencesSubject = new BehaviorSubject<NotificationPreferences | null>(null);
  private statsSubject = new BehaviorSubject<NotificationStats | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive programming
  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);
  public preferences = signal<NotificationPreferences | null>(null);
  public stats = signal<NotificationStats | null>(null);
  public isLoading = signal<boolean>(false);

  private currentUserId = 'current-user-id'; // Mock current user

  constructor() {
    // Subscribe to subjects and update signals
    this.notificationsSubject.subscribe(notifications => this.notifications.set(notifications));
    this.unreadCountSubject.subscribe(count => this.unreadCount.set(count));
    this.preferencesSubject.subscribe(prefs => this.preferences.set(prefs));
    this.statsSubject.subscribe(stats => this.stats.set(stats));
    this.isLoadingSubject.subscribe(loading => this.isLoading.set(loading));

    this.loadPreferences();
    this.requestNotificationPermission();
  }

  // Notification Management
  getNotifications(params?: any): Observable<{ notifications: Notification[]; total: number; hasMore: boolean }> {
    this.isLoadingSubject.next(true);
    
    return this.http.get<{ notifications: Notification[]; total: number; hasMore: boolean }>(`${this.API_URL}/notifications`, { params }).pipe(
      tap(response => {
        this.notificationsSubject.next(response.notifications);
        this.updateUnreadCount();
        this.isLoadingSubject.next(false);
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  getNotification(notificationId: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.API_URL}/notifications/${notificationId}`);
  }

  markAsRead(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/read`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isRead: true, readAt: new Date() });
        }
      })
    );
  }

  markAsUnread(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/unread`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isRead: false, readAt: undefined });
        }
      })
    );
  }

  markAllAsRead(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/read-all`, {}).pipe(
      tap(response => {
        if (response.success) {
          const currentNotifications = this.notifications();
          const updatedNotifications = currentNotifications.map(n => ({
            ...n,
            isRead: true,
            readAt: new Date()
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }
      })
    );
  }

  pinNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/pin`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isPinned: true });
        }
      })
    );
  }

  unpinNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/unpin`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isPinned: false });
        }
      })
    );
  }

  muteNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/mute`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isMuted: true });
        }
      })
    );
  }

  unmuteNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/unmute`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, { isMuted: false });
        }
      })
    );
  }

  deleteNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}`).pipe(
      tap(response => {
        if (response.success) {
          const currentNotifications = this.notifications();
          this.notificationsSubject.next(currentNotifications.filter(n => n.id !== notificationId));
          this.updateUnreadCount();
        }
      })
    );
  }

  // Notification Actions
  performAction(notificationId: string, action: NotificationAction): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/notifications/${notificationId}/actions`, action).pipe(
      tap(response => {
        if (response.success) {
          // Handle action-specific logic
          this.handleNotificationAction(notificationId, action);
        }
      })
    );
  }

  // Preferences Management
  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.API_URL}/notifications/preferences`).pipe(
      tap(preferences => {
        this.preferencesSubject.next(preferences);
        this.savePreferencesToStorage(preferences);
      })
    );
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.API_URL}/notifications/preferences`, preferences).pipe(
      tap(updatedPreferences => {
        this.preferencesSubject.next(updatedPreferences);
        this.savePreferencesToStorage(updatedPreferences);
      })
    );
  }

  // Statistics
  getStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.API_URL}/notifications/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // Categories
  getCategories(): Observable<NotificationCategory[]> {
    return this.http.get<NotificationCategory[]>(`${this.API_URL}/notifications/categories`);
  }

  // Push Notifications
  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.updatePreferences({ desktopPushEnabled: true });
        }
      });
    }
  }

  showDesktopNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        tag: notification.id,
        data: notification
      });

      desktopNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        desktopNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    }
  }

  // Sound Notifications
  playNotificationSound(type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'chat' | 'approval' | 'payroll' | 'finance' = 'info'): void {
    const preferences = this.preferences();
    if (preferences?.soundEnabled) {
      // Map extended notification types to basic sound types
      let soundType: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (type === 'success') {
        soundType = 'success';
      } else if (type === 'warning') {
        soundType = 'warning';
      } else if (type === 'error') {
        soundType = 'error';
      } else {
        // Map system, chat, approval, payroll, finance to 'info' sound
        soundType = 'info';
      }
      
      const audio = new Audio(`/assets/sounds/notification-${soundType}.mp3`);
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    }
  }

  // Real-time Updates
  handleRealtimeNotification(data: any): void {
    switch (data.type) {
      case 'notification.created':
        this.addNotification(data.notification);
        break;
      case 'notification.updated':
        this.updateNotification(data.notification);
        break;
      case 'notification.deleted':
        this.removeNotification(data.notificationId);
        break;
      case 'notification.badge':
        this.updateUnreadCount(data.unreadCount);
        break;
    }
  }

  // Utility Methods
  private updateNotificationStatus(notificationId: string, updates: Partial<Notification>): void {
    const currentNotifications = this.notifications();
    const index = currentNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      currentNotifications[index] = { ...currentNotifications[index], ...updates };
      this.notificationsSubject.next([...currentNotifications]);
      this.updateUnreadCount();
    }
  }

  private updateUnreadCount(count?: number): void {
    if (count !== undefined) {
      this.unreadCountSubject.next(count);
    } else {
      const unreadCount = this.notifications().filter(n => !n.isRead).length;
      this.unreadCountSubject.next(unreadCount);
    }
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications();
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.updateUnreadCount();
    
    // Show desktop notification if enabled
    const preferences = this.preferences();
    if (preferences?.desktopPushEnabled) {
      this.showDesktopNotification(notification);
    }
    
    // Play sound if enabled
    this.playNotificationSound(notification.type);
  }

  private updateNotification(notification: Notification): void {
    const currentNotifications = this.notifications();
    const index = currentNotifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      currentNotifications[index] = notification;
      this.notificationsSubject.next([...currentNotifications]);
      this.updateUnreadCount();
    }
  }

  private removeNotification(notificationId: string): void {
    const currentNotifications = this.notifications();
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== notificationId));
    this.updateUnreadCount();
  }

  private handleNotificationAction(notificationId: string, action: NotificationAction): void {
    // Handle specific action types
    switch (action.actionType) {
      case 'approve':
        // Handle approval action
        break;
      case 'reject':
        // Handle rejection action
        break;
      case 'view':
        // Handle view action
        break;
      case 'dismiss':
        // Handle dismiss action
        break;
    }
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        this.preferencesSubject.next(preferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private savePreferencesToStorage(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  // Mock data for development
  getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        title: 'Leave Request Approved',
        message: 'Your annual leave request for Feb 15-20 has been approved by Bob Johnson',
        type: 'success',
        category: { id: 'leave', name: 'Leave Management', description: 'Leave-related notifications', icon: 'calendar', color: 'blue' },
        priority: 'normal',
        isRead: false,
        isPinned: false,
        isMuted: false,
        actionUrl: '/app/leave/requests/123',
        actionLabel: 'View Request',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Approval Required',
        message: 'John Doe submitted a leave request that requires your approval',
        type: 'approval',
        category: { id: 'approval', name: 'Approvals', description: 'Approval-related notifications', icon: 'check-circle', color: 'orange' },
        priority: 'high',
        isRead: false,
        isPinned: false,
        isMuted: false,
        actionUrl: '/app/inbox',
        actionLabel: 'Review',
        actionData: { requestId: '456', action: 'approve' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Payslip Ready',
        message: 'Your payslip for January 2024 is now available',
        type: 'payroll',
        category: { id: 'payroll', name: 'Payroll', description: 'Payroll-related notifications', icon: 'currency-dollar', color: 'green' },
        priority: 'normal',
        isRead: true,
        isPinned: false,
        isMuted: false,
        actionUrl: '/app/payslips/2024-01',
        actionLabel: 'View Payslip',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
      },
      {
        id: '4',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM',
        type: 'system',
        category: { id: 'system', name: 'System', description: 'System-related notifications', icon: 'cog', color: 'gray' },
        priority: 'normal',
        isRead: false,
        isPinned: true,
        isMuted: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
  }

  getMockCategories(): NotificationCategory[] {
    return [
      { id: 'approval', name: 'Approvals', description: 'Approval-related notifications', icon: 'check-circle', color: 'orange' },
      { id: 'leave', name: 'Leave Management', description: 'Leave-related notifications', icon: 'calendar', color: 'blue' },
      { id: 'payroll', name: 'Payroll', description: 'Payroll-related notifications', icon: 'currency-dollar', color: 'green' },
      { id: 'finance', name: 'Finance', description: 'Finance-related notifications', icon: 'chart-bar', color: 'purple' },
      { id: 'chat', name: 'Chat', description: 'Chat-related notifications', icon: 'chat', color: 'indigo' },
      { id: 'system', name: 'System', description: 'System-related notifications', icon: 'cog', color: 'gray' }
    ];
  }

  getMockPreferences(): NotificationPreferences {
    return {
      userId: this.currentUserId,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      },
      digestFrequency: 'daily',
      moduleSettings: {
        'approval': {
          enabled: true,
          channels: { inApp: true, email: true, sms: false, push: true },
          granularity: 'assigned-to-me'
        },
        'leave': {
          enabled: true,
          channels: { inApp: true, email: true, sms: false, push: false },
          granularity: 'all'
        },
        'payroll': {
          enabled: true,
          channels: { inApp: true, email: true, sms: false, push: true },
          granularity: 'all'
        }
      },
      soundEnabled: true,
      desktopPushEnabled: true
    };
  }
}
