import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, retry, retryWhen, delay } from 'rxjs/operators';

export interface ChatThread {
  id: string;
  subject: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
  contextRef?: {
    moduleType: string;
    subjectId: string;
    subjectTitle: string;
  };
  typingUsers: string[];
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  role: string;
  joinedAt: Date;
  lastSeen: Date;
  presence: 'online' | 'idle' | 'offline';
  isTyping: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments: ChatAttachment[];
  mentions: string[];
  reactions: ChatReaction[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  deliveredAt?: Date;
  readBy: ChatReadReceipt[];
  replyTo?: string;
  metadata?: any;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ChatReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface ChatReadReceipt {
  userId: string;
  userName: string;
  readAt: Date;
}

export interface ChatSearchResult {
  threads: ChatThread[];
  messages: ChatMessage[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ChatDraft {
  threadId: string;
  content: string;
  attachments: File[];
  mentions: string[];
  lastSaved: Date;
}

export interface CallSession {
  id: string;
  participants: string[];
  initiator: string;
  status: 'ringing' | 'connecting' | 'connected' | 'ended';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  type: 'audio' | 'video';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  private readonly DRAFTS_KEY = 'chat_drafts';
  private readonly HEARTBEAT_INTERVAL = 25000; // 25 seconds
  private readonly IDLE_THRESHOLD = 300000; // 5 minutes

  private threadsSubject = new BehaviorSubject<ChatThread[]>([]);
  private currentThreadSubject = new BehaviorSubject<ChatThread | null>(null);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private participantsSubject = new BehaviorSubject<ChatParticipant[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private typingUsersSubject = new BehaviorSubject<string[]>([]);
  private presenceSubject = new BehaviorSubject<Map<string, string>>(new Map());

  // Signals for reactive programming
  public threads = signal<ChatThread[]>([]);
  public currentThread = signal<ChatThread | null>(null);
  public messages = signal<ChatMessage[]>([]);
  public participants = signal<ChatParticipant[]>([]);
  public unreadCount = signal<number>(0);
  public typingUsers = signal<string[]>([]);
  public presence = signal<Map<string, string>>(new Map());
  public isLoading = signal(false);

  private heartbeatTimer?: number;
  private typingTimer?: number;
  private currentUserId = 'current-user-id'; // Mock current user

  constructor() {
    // Subscribe to subjects and update signals
    this.threadsSubject.subscribe(threads => this.threads.set(threads));
    this.currentThreadSubject.subscribe(thread => this.currentThread.set(thread));
    this.messagesSubject.subscribe(messages => this.messages.set(messages));
    this.participantsSubject.subscribe(participants => this.participants.set(participants));
    this.unreadCountSubject.subscribe(count => this.unreadCount.set(count));
    this.typingUsersSubject.subscribe(users => this.typingUsers.set(users));
    this.presenceSubject.subscribe(presence => this.presence.set(presence));

    this.startHeartbeat();
    this.loadDrafts();
  }

  // Thread Management
  getThreads(params?: any): Observable<{ threads: ChatThread[]; total: number; hasMore: boolean }> {
    this.isLoading.set(true);
    
    return this.http.get<{ threads: ChatThread[]; total: number; hasMore: boolean }>(`${this.API_URL}/chat/threads`, { params }).pipe(
      tap(response => {
        this.threadsSubject.next(response.threads);
        this.updateUnreadCount();
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  getThread(threadId: string): Observable<ChatThread> {
    this.isLoading.set(true);
    
    return this.http.get<ChatThread>(`${this.API_URL}/chat/threads/${threadId}`).pipe(
      tap(thread => {
        this.currentThreadSubject.next(thread);
        this.participantsSubject.next(thread.participants);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  createThread(threadData: { participants: string[]; subject: string; contextRef?: any }): Observable<ChatThread> {
    this.isLoading.set(true);
    
    return this.http.post<ChatThread>(`${this.API_URL}/chat/threads`, threadData).pipe(
      tap(thread => {
        const currentThreads = this.threads();
        this.threadsSubject.next([thread, ...currentThreads]);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  updateThread(threadId: string, updates: Partial<ChatThread>): Observable<ChatThread> {
    return this.http.put<ChatThread>(`${this.API_URL}/chat/threads/${threadId}`, updates).pipe(
      tap(updatedThread => {
        const currentThreads = this.threads();
        const index = currentThreads.findIndex(t => t.id === threadId);
        if (index !== -1) {
          currentThreads[index] = updatedThread;
          this.threadsSubject.next([...currentThreads]);
        }
        
        if (this.currentThread()?.id === threadId) {
          this.currentThreadSubject.next(updatedThread);
        }
      })
    );
  }

  // Message Management
  getMessages(threadId: string, params?: any): Observable<{ messages: ChatMessage[]; hasMore: boolean }> {
    this.isLoading.set(true);
    
    return this.http.get<{ messages: ChatMessage[]; hasMore: boolean }>(`${this.API_URL}/chat/threads/${threadId}/messages`, { params }).pipe(
      tap(response => {
        this.messagesSubject.next(response.messages);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  sendMessage(messageData: { threadId: string; content: string; attachments?: File[]; mentions?: string[] }): Observable<ChatMessage> {
    const idempotencyKey = `msg-${Date.now()}-${Math.random()}`;
    
    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: `temp-${idempotencyKey}`,
      threadId: messageData.threadId,
      userId: this.currentUserId,
      userName: 'You',
      content: messageData.content,
      type: 'text',
      attachments: [],
      mentions: messageData.mentions || [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      readBy: []
    };

    this.addOptimisticMessage(optimisticMessage);

    const formData = new FormData();
    formData.append('content', messageData.content);
    formData.append('idempotencyKey', idempotencyKey);
    if (messageData.mentions) {
      formData.append('mentions', JSON.stringify(messageData.mentions));
    }
    if (messageData.attachments) {
      messageData.attachments.forEach(file => formData.append('attachments', file));
    }

    return this.http.post<ChatMessage>(`${this.API_URL}/chat/threads/${messageData.threadId}/messages`, formData).pipe(
      tap(message => {
        this.replaceOptimisticMessage(optimisticMessage.id, message);
        this.updateThreadLastMessage(messageData.threadId, message);
      }),
      catchError(error => {
        this.removeOptimisticMessage(optimisticMessage.id);
        return throwError(() => error);
      })
    );
  }

  editMessage(messageId: string, content: string): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.API_URL}/chat/messages/${messageId}`, { content }).pipe(
      tap(updatedMessage => {
        this.updateMessage(updatedMessage);
      })
    );
  }

  deleteMessage(messageId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/chat/messages/${messageId}`).pipe(
      tap(response => {
        if (response.success) {
          this.markMessageAsDeleted(messageId);
        }
      })
    );
  }

  reactToMessage(messageId: string, emoji: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/chat/messages/${messageId}/react`, { emoji }).pipe(
      tap(response => {
        if (response.success) {
          this.addReactionToMessage(messageId, emoji);
        }
      })
    );
  }

  // Search
  searchMessages(query: string, scope: 'threads' | 'messages' = 'messages', params?: any): Observable<ChatSearchResult> {
    return this.http.get<ChatSearchResult>(`${this.API_URL}/chat/search`, {
      params: { q: query, scope, ...params }
    });
  }

  // Presence and Typing
  updatePresence(status: 'online' | 'idle' | 'offline'): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/chat/presence`, { status });
  }

  startTyping(threadId: string): void {
    this.http.post(`${this.API_URL}/chat/threads/${threadId}/typing`, { action: 'start' }).subscribe();
  }

  stopTyping(threadId: string): void {
    this.http.post(`${this.API_URL}/chat/threads/${threadId}/typing`, { action: 'stop' }).subscribe();
  }

  // Drafts Management
  saveDraft(threadId: string, content: string, attachments: File[] = [], mentions: string[] = []): void {
    const drafts = this.getDrafts();
    drafts[threadId] = {
      threadId,
      content,
      attachments,
      mentions,
      lastSaved: new Date()
    };
    localStorage.setItem(this.DRAFTS_KEY, JSON.stringify(drafts));
  }

  getDraft(threadId: string): ChatDraft | null {
    const drafts = this.getDrafts();
    return drafts[threadId] || null;
  }

  clearDraft(threadId: string): void {
    const drafts = this.getDrafts();
    delete drafts[threadId];
    localStorage.setItem(this.DRAFTS_KEY, JSON.stringify(drafts));
  }

  // Real-time Updates
  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      this.updatePresence('online').subscribe();
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  // WebSocket Integration
  handleRealtimeMessage(message: any): void {
    switch (message.type) {
      case 'chat.thread.updated':
        this.handleThreadUpdate(message.data);
        break;
      case 'chat.message.created':
        this.handleMessageCreated(message.data);
        break;
      case 'chat.message.edited':
        this.handleMessageEdited(message.data);
        break;
      case 'chat.message.deleted':
        this.handleMessageDeleted(message.data);
        break;
      case 'presence.user.updated':
        this.handlePresenceUpdate(message.data);
        break;
      case 'chat.typing.start':
        this.handleTypingStart(message.data);
        break;
      case 'chat.typing.stop':
        this.handleTypingStop(message.data);
        break;
    }
  }

  private handleThreadUpdate(data: any): void {
    const currentThreads = this.threads();
    const index = currentThreads.findIndex(t => t.id === data.id);
    if (index !== -1) {
      currentThreads[index] = { ...currentThreads[index], ...data };
      this.threadsSubject.next([...currentThreads]);
    }
  }

  private handleMessageCreated(data: any): void {
    const currentMessages = this.messages();
    this.messagesSubject.next([...currentMessages, data]);
    
    if (data.threadId === this.currentThread()?.id) {
      this.updateThreadLastMessage(data.threadId, data);
    }
  }

  private handleMessageEdited(data: any): void {
    this.updateMessage(data);
  }

  private handleMessageDeleted(data: any): void {
    this.markMessageAsDeleted(data.id);
  }

  private handlePresenceUpdate(data: any): void {
    const currentPresence = this.presence();
    currentPresence.set(data.userId, data.status);
    this.presenceSubject.next(new Map(currentPresence));
  }

  private handleTypingStart(data: any): void {
    const currentTyping = this.typingUsers();
    if (!currentTyping.includes(data.userId)) {
      this.typingUsersSubject.next([...currentTyping, data.userId]);
    }
  }

  private handleTypingStop(data: any): void {
    const currentTyping = this.typingUsers();
    this.typingUsersSubject.next(currentTyping.filter(id => id !== data.userId));
  }

  // Helper Methods
  private addOptimisticMessage(message: ChatMessage): void {
    const currentMessages = this.messages();
    this.messagesSubject.next([...currentMessages, message]);
  }

  private replaceOptimisticMessage(tempId: string, realMessage: ChatMessage): void {
    const currentMessages = this.messages();
    const index = currentMessages.findIndex(m => m.id === tempId);
    if (index !== -1) {
      currentMessages[index] = realMessage;
      this.messagesSubject.next([...currentMessages]);
    }
  }

  private removeOptimisticMessage(tempId: string): void {
    const currentMessages = this.messages();
    this.messagesSubject.next(currentMessages.filter(m => m.id !== tempId));
  }

  private updateMessage(updatedMessage: ChatMessage): void {
    const currentMessages = this.messages();
    const index = currentMessages.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
      currentMessages[index] = updatedMessage;
      this.messagesSubject.next([...currentMessages]);
    }
  }

  private markMessageAsDeleted(messageId: string): void {
    const currentMessages = this.messages();
    const index = currentMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      currentMessages[index] = { ...currentMessages[index], isDeleted: true, deletedAt: new Date() };
      this.messagesSubject.next([...currentMessages]);
    }
  }

  private addReactionToMessage(messageId: string, emoji: string): void {
    const currentMessages = this.messages();
    const index = currentMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const message = currentMessages[index];
      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        existingReaction.count++;
        existingReaction.users.push(this.currentUserId);
      } else {
        message.reactions.push({
          emoji,
          users: [this.currentUserId],
          count: 1
        });
      }
      this.messagesSubject.next([...currentMessages]);
    }
  }

  private updateThreadLastMessage(threadId: string, message: ChatMessage): void {
    const currentThreads = this.threads();
    const index = currentThreads.findIndex(t => t.id === threadId);
    if (index !== -1) {
      currentThreads[index] = { ...currentThreads[index], lastMessage: message, updatedAt: new Date() };
      this.threadsSubject.next([...currentThreads]);
    }
  }

  private updateUnreadCount(): void {
    const totalUnread = this.threads().reduce((sum, thread) => sum + thread.unreadCount, 0);
    this.unreadCountSubject.next(totalUnread);
  }

  private getDrafts(): Record<string, ChatDraft> {
    try {
      return JSON.parse(localStorage.getItem(this.DRAFTS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private loadDrafts(): void {
    // Load drafts on service initialization
    const drafts = this.getDrafts();
    // Process drafts if needed
  }

  // Mock data for development
  getMockThreads(): ChatThread[] {
    return [
      {
        id: '1',
        subject: 'HR Team Discussion',
        participants: [
          {
            userId: 'hr1',
            userName: 'Alice Johnson',
            userEmail: 'alice.johnson@company.com',
            role: 'HR Manager',
            joinedAt: new Date(),
            lastSeen: new Date(),
            presence: 'online',
            isTyping: false
          },
          {
            userId: 'hr2',
            userName: 'Bob Smith',
            userEmail: 'bob.smith@company.com',
            role: 'HR Specialist',
            joinedAt: new Date(),
            lastSeen: new Date(Date.now() - 5 * 60 * 1000),
            presence: 'idle',
            isTyping: false
          }
        ],
        lastMessage: {
          id: 'msg1',
          threadId: '1',
          userId: 'hr1',
          userName: 'Alice Johnson',
          content: 'Please review the new policy document',
          type: 'text',
          attachments: [],
          mentions: [],
          reactions: [],
          isEdited: false,
          isDeleted: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          readBy: []
        },
        unreadCount: 2,
        isPinned: true,
        isMuted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        typingUsers: []
      },
      {
        id: '2',
        subject: 'Project Alpha Discussion',
        participants: [
          {
            userId: 'dev1',
            userName: 'John Doe',
            userEmail: 'john.doe@company.com',
            role: 'Developer',
            joinedAt: new Date(),
            lastSeen: new Date(Date.now() - 2 * 60 * 1000),
            presence: 'online',
            isTyping: true
          }
        ],
        lastMessage: {
          id: 'msg2',
          threadId: '2',
          userId: 'dev1',
          userName: 'John Doe',
          content: 'The implementation looks good to me',
          type: 'text',
          attachments: [],
          mentions: [],
          reactions: [],
          isEdited: false,
          isDeleted: false,
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          readBy: []
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        typingUsers: ['dev1']
      }
    ];
  }

  ngOnDestroy(): void {
    this.stopHeartbeat();
  }
}
