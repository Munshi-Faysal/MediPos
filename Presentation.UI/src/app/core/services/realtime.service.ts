import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface RealtimeMessage {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  channel?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  
  private messagesSubject = new BehaviorSubject<RealtimeMessage[]>([]);
  
  // Signals for reactive programming
  public connectionStatus = signal<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  public messages = signal<RealtimeMessage[]>([]);
  public isConnected = signal(false);

  constructor() {
    this.connectionStatusSubject.subscribe(status => {
      this.connectionStatus.set(status);
      this.isConnected.set(status.connected);
    });

    this.messagesSubject.subscribe(messages => {
      this.messages.set(messages);
    });
  }

  connect(url = 'ws://localhost:8000/ws'): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Temporarily disable WebSocket connection to prevent unresponsive behavior
      console.log('WebSocket connection disabled temporarily to prevent unresponsive behavior');
      return;
      
      // Uncomment when WebSocket is properly configured on backend
      // this.ws = new WebSocket(url);
      // this.setupWebSocketHandlers();
    } catch (error) {
      this.handleConnectionError(error as Error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connectionStatusSubject.next({
      connected: false,
      reconnecting: false
    });
  }

  sendMessage(type: string, data: any, channel?: string): void {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    const message: RealtimeMessage = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date(),
      channel
    };

    this.ws?.send(JSON.stringify(message));
  }

  subscribeToChannel(channel: string): Observable<RealtimeMessage> {
    return this.messagesSubject.pipe(
      map(messages => messages.filter(msg => msg.channel === channel)),
      filter(messages => messages.length > 0),
      map(messages => messages[messages.length - 1])
    );
  }

  subscribeToType(type: string): Observable<RealtimeMessage> {
    return this.messagesSubject.pipe(
      map(messages => messages.filter(msg => msg.type === type)),
      filter(messages => messages.length > 0),
      map(messages => messages[messages.length - 1])
    );
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  getMessages(): Observable<RealtimeMessage[]> {
    return this.messagesSubject.asObservable();
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectionStatusSubject.next({
        connected: true,
        reconnecting: false,
        lastConnected: new Date()
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connectionStatusSubject.next({
        connected: false,
        reconnecting: false
      });

      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleConnectionError(new Error('WebSocket connection error'));
    };
  }

  private handleIncomingMessage(message: RealtimeMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    // Handle specific message types
    switch (message.type) {
      case 'notification':
        this.handleNotificationMessage(message);
        break;
      case 'chat':
        this.handleChatMessage(message);
        break;
      case 'typing':
        this.handleTypingMessage(message);
        break;
      case 'presence':
        this.handlePresenceMessage(message);
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  private handleNotificationMessage(message: RealtimeMessage): void {
    // This would integrate with the NotificationService
    console.log('Received notification:', message.data);
  }

  private handleChatMessage(message: RealtimeMessage): void {
    // This would integrate with the chat module
    console.log('Received chat message:', message.data);
  }

  private handleTypingMessage(message: RealtimeMessage): void {
    // This would show typing indicators in chat
    console.log('User is typing:', message.data);
  }

  private handlePresenceMessage(message: RealtimeMessage): void {
    // This would update user presence status
    console.log('Presence update:', message.data);
  }

  private scheduleReconnect(): void {
    this.connectionStatusSubject.next({
      connected: false,
      reconnecting: true
    });

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handleConnectionError(error: Error): void {
    this.connectionStatusSubject.next({
      connected: false,
      reconnecting: false,
      error: error.message
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Chat-specific methods
  joinChatRoom(roomId: string): void {
    this.sendMessage('join_room', { roomId }, 'chat');
  }

  leaveChatRoom(roomId: string): void {
    this.sendMessage('leave_room', { roomId }, 'chat');
  }

  sendChatMessage(roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): void {
    this.sendMessage('chat_message', {
      roomId,
      content,
      type
    }, 'chat');
  }

  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    this.sendMessage('typing', {
      roomId,
      isTyping
    }, 'chat');
  }

  // Audio call methods (WebRTC integration)
  initiateCall(userId: string): void {
    this.sendMessage('call_initiate', { userId }, 'call');
  }

  acceptCall(callId: string): void {
    this.sendMessage('call_accept', { callId }, 'call');
  }

  rejectCall(callId: string): void {
    this.sendMessage('call_reject', { callId }, 'call');
  }

  endCall(callId: string): void {
    this.sendMessage('call_end', { callId }, 'call');
  }
}

