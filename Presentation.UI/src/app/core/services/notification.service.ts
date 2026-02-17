import { Injectable, signal, Injector, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Notification } from '../models';
import { TOASTR_SERVICE_TOKEN } from '../config/toastr.config';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private injector = inject(Injector);
  private injectedToastr = inject(TOASTR_SERVICE_TOKEN, { optional: true });

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private toastSubject = new BehaviorSubject<ToastNotification[]>([]);

  // Signals for reactive programming
  public notifications = signal<Notification[]>([]);
  public unreadCount = signal(0);
  public toasts = signal<ToastNotification[]>([]);

  private toastr: any = null;

  constructor() {
    // Try to get ToastrService from direct injection first
    if (this.injectedToastr && typeof this.injectedToastr.success === 'function') {
      this.toastr = this.injectedToastr;
    }

    this.notificationsSubject.subscribe(notifications => {
      this.notifications.set(notifications);
      this.unreadCount.set(notifications.filter(n => !n.read).length);
    });

    this.toastSubject.subscribe(toasts => {
      this.toasts.set(toasts);
    });
  }

  private getToastr(): any {
    if (this.toastr) {
      return this.toastr;
    }
    // Toastr is explicitly disabled in this project configuration
    // Fallback to SweetAlert2 is handled in the calling methods
    return null;
  }

  // Toast notifications using ngx-toastr
  showToast(toast: Omit<ToastNotification, 'id'>): void {
    const toastr = this.getToastr();
    if (!toastr) {
      console.warn('ToastrService is not available');
      return;
    }

    const toastConfig = {
      timeOut: toast.duration || 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true
    };

    switch (toast.type) {
      case 'success':
        toastr.success(toast.message, toast.title, toastConfig);
        break;
      case 'error':
        toastr.error(toast.message, toast.title, toastConfig);
        break;
      case 'warning':
        toastr.warning(toast.message, toast.title, toastConfig);
        break;
      case 'info':
      default:
        toastr.info(toast.message, toast.title, toastConfig);
        break;
    }
  }

  success(title: string, message: string, duration?: number): void {
    const toastr = this.getToastr();
    if (toastr) {
      // Use ngx-toastr if available
      try {
        toastr.success(message, title, {
          timeOut: duration || 3000,
          closeButton: true,
          progressBar: true,
          preventDuplicates: true
        });
        return;
      } catch (error) {
        console.error('Error calling toastr.success:', error);
      }
    }

    // Fallback to SweetAlert2 toast
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: duration || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  error(title: string, message: string, duration?: number): void {
    const toastr = this.getToastr();
    if (toastr) {
      toastr.error(message, title, {
        timeOut: duration || 3000,
        closeButton: true,
        progressBar: true,
        preventDuplicates: true
      });
      return;
    }

    // Fallback to SweetAlert2 toast
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: duration || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  warning(title: string, message: string, duration?: number): void {
    const toastr = this.getToastr();
    if (toastr) {
      toastr.warning(message, title, {
        timeOut: duration || 3000,
        closeButton: true,
        progressBar: true,
        preventDuplicates: true
      });
      return;
    }

    // Fallback to SweetAlert2 toast
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: duration || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  info(title: string, message: string, duration?: number): void {
    const toastr = this.getToastr();
    if (toastr) {
      toastr.info(message, title, {
        timeOut: duration || 3000,
        closeButton: true,
        progressBar: true,
        preventDuplicates: true
      });
      return;
    }

    // Fallback to SweetAlert2 toast
    Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: duration || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  removeToast(id: string): void {
    const toastr = this.getToastr();
    if (!toastr) return;
    // Toastr handles removal automatically, but we keep this for backward compatibility
    toastr.clear();
  }

  clearAllToasts(): void {
    const toastr = this.getToastr();
    if (!toastr) return;
    toastr.clear();
  }

  // In-app notifications
  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.notificationsSubject.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(notification =>
      ({ ...notification, read: true })
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      notifications.filter(notification => notification.id !== notificationId)
    );
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  // Simulated notification methods (replace with real API calls)
  fetchNotifications(): void {
    // This would typically make an API call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Leave Request',
        message: 'John Doe has submitted a leave request for 3 days',
        type: 'info',
        read: false,
        createdAt: new Date(),
        actionUrl: '/app/approvals'
      },
      {
        id: '2',
        title: 'Payroll Processed',
        message: 'Monthly payroll has been processed successfully',
        type: 'success',
        read: false,
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM',
        type: 'warning',
        read: true,
        createdAt: new Date()
      }
    ];

    this.notificationsSubject.next(mockNotifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Real-time notifications (WebSocket integration)
  connectToRealtime(): void {
    // This would connect to WebSocket for real-time notifications
    console.log('Connecting to real-time notifications...');
  }

  disconnectFromRealtime(): void {
    // This would disconnect from WebSocket
    console.log('Disconnecting from real-time notifications...');
  }
}
