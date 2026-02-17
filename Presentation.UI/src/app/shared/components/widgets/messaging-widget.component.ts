import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';


export interface ChatThread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  participants: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-messaging-widget',
  standalone: true,
  imports: [],
  templateUrl: './messaging-widget.component.html',
  styleUrls: ['./messaging-widget.component.scss']
})
export class MessagingWidgetComponent implements OnInit, OnChanges {
  @Input() threads: ChatThread[] = [];
  @Input() title = 'Messages';
  @Input() subtitle = 'Recent conversations';
  @Input() isLoading = false;
  @Input() maxItems = 5;

  @Output() refresh = new EventEmitter<void>();
  @Output() drillThrough = new EventEmitter<any>();
  @Output() threadClick = new EventEmitter<ChatThread>();
  @Output() startCall = new EventEmitter<ChatThread>();

  public displayedThreads = signal<ChatThread[]>([]);
  public totalUnreadCount = signal<number>(0);

  ngOnInit(): void {
    this.updateDisplayedThreads();
  }

  ngOnChanges(): void {
    this.updateDisplayedThreads();
  }

  private updateDisplayedThreads(): void {
    if (this.threads) {
      const sorted = [...this.threads].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.displayedThreads.set(sorted.slice(0, this.maxItems));
      this.totalUnreadCount.set(this.threads.reduce((sum, thread) => sum + thread.unreadCount, 0));
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

  public getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  public truncateMessage(message: string, maxLength = 50): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }

  public onThreadClick(thread: ChatThread): void {
    this.threadClick.emit(thread);
  }

  public onStartCall(thread: ChatThread, event: Event): void {
    event.stopPropagation();
    this.startCall.emit(thread);
  }

  public onRefresh(): void {
    this.refresh.emit();
  }

  public onDrillThrough(): void {
    this.drillThrough.emit();
  }

}
