import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';


export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

@Component({
  selector: 'app-notifications-widget',
  standalone: true,
  imports: [],
  templateUrl: './notifications-widget.component.html',
  styleUrls: ['./notifications-widget.component.scss']
})
export class NotificationsWidgetComponent implements OnInit, OnChanges {
  @Input() notifications: NotificationItem[] = [];
  @Input() title = 'Notifications';
  @Input() subtitle = 'Recent updates';
  @Input() isLoading = false;
  @Input() maxItems = 5;

  @Output() refresh = new EventEmitter<void>();
  @Output() drillThrough = new EventEmitter<any>();
  @Output() notificationClick = new EventEmitter<NotificationItem>();

  public displayedNotifications = signal<NotificationItem[]>([]);
  public unreadCount = signal<number>(0);

  ngOnInit(): void {
    this.updateDisplayedNotifications();
  }

  ngOnChanges(): void {
    this.updateDisplayedNotifications();
  }

  private updateDisplayedNotifications(): void {
    if (this.notifications) {
      const sorted = [...this.notifications].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.displayedNotifications.set(sorted.slice(0, this.maxItems));
      this.unreadCount.set(this.notifications.filter(n => !n.isRead).length);
    }
  }

  public getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'error': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  public getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return 'text-success-600 bg-success-100';
      case 'warning': return 'text-warning-600 bg-warning-100';
      case 'error': return 'text-error-600 bg-error-100';
      default: return 'text-primary-600 bg-primary-100';
    }
  }

  public formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  public onNotificationClick(notification: NotificationItem): void {
    this.notificationClick.emit(notification);
  }

  public onRefresh(): void {
    this.refresh.emit();
  }

  public onDrillThrough(): void {
    this.drillThrough.emit();
  }

}
