import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface CallSession {
  id: string;
  participants: CallParticipant[];
  initiator: string;
  status: 'ringing' | 'connecting' | 'connected' | 'ended' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  type: 'audio' | 'video';
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isMuted: boolean;
  isSpeakerOn: boolean;
  isOnHold: boolean;
  isScreenSharing: boolean;
}

export interface CallParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioLevel: number;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
}

export interface CallDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  isDefault: boolean;
}

export interface CallStats {
  audioPacketsLost: number;
  audioPacketsReceived: number;
  audioPacketsSent: number;
  videoPacketsLost: number;
  videoPacketsReceived: number;
  videoPacketsSent: number;
  roundTripTime: number;
  bandwidth: number;
}

export interface CallConfig {
  iceServers: RTCIceServer[];
  turnServers: RTCIceServer[];
  audioConstraints: MediaStreamConstraints;
  videoConstraints: MediaStreamConstraints;
}

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  private readonly SIGNALING_URL = 'ws://localhost:8000/ws/calls';
  
  private callSessionSubject = new BehaviorSubject<CallSession | null>(null);
  private participantsSubject = new BehaviorSubject<CallParticipant[]>([]);
  private devicesSubject = new BehaviorSubject<CallDevice[]>([]);
  private statsSubject = new BehaviorSubject<CallStats | null>(null);
  private isInCallSubject = new BehaviorSubject<boolean>(false);
  private isRingingSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive programming
  public callSession = signal<CallSession | null>(null);
  public participants = signal<CallParticipant[]>([]);
  public devices = signal<CallDevice[]>([]);
  public stats = signal<CallStats | null>(null);
  public isInCall = signal<boolean>(false);
  public isRinging = signal<boolean>(false);

  private peerConnection?: RTCPeerConnection;
  private localStream?: MediaStream;
  private signalingSocket?: WebSocket;
  private callTimer?: number;
  private statsTimer?: number;
  private currentUserId = 'current-user-id';

  constructor() {
    // Subscribe to subjects and update signals
    this.callSessionSubject.subscribe(session => this.callSession.set(session));
    this.participantsSubject.subscribe(participants => this.participants.set(participants));
    this.devicesSubject.subscribe(devices => this.devices.set(devices));
    this.statsSubject.subscribe(stats => this.stats.set(stats));
    this.isInCallSubject.subscribe(inCall => this.isInCall.set(inCall));
    this.isRingingSubject.subscribe(ringing => this.isRinging.set(ringing));

    this.loadDevices();
    this.setupSignalingSocket();
  }

  // Call Management
  initiateCall(participants: string[], type: 'audio' | 'video' = 'audio'): Observable<CallSession> {
    this.isRingingSubject.next(true);
    
    return this.http.post<CallSession>(`${this.API_URL}/calls`, {
      participants,
      type,
      initiator: this.currentUserId
    }).pipe(
      tap(session => {
        this.callSessionSubject.next(session);
        this.startCallTimer();
        this.requestMediaPermissions(type);
      }),
      catchError(error => {
        this.isRingingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  acceptCall(callId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/calls/${callId}/accept`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.isRingingSubject.next(false);
          this.isInCallSubject.next(true);
          this.updateCallStatus('connected');
        }
      })
    );
  }

  rejectCall(callId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/calls/${callId}/reject`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.endCall('rejected');
        }
      })
    );
  }

  endCall(reason: 'ended' | 'rejected' | 'failed' = 'ended'): void {
    const session = this.callSession();
    if (session) {
      this.http.post(`${this.API_URL}/calls/${session.id}/end`, { reason }).subscribe();
    }
    
    this.cleanupCall();
  }

  // Call Controls
  toggleMute(): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      const session = this.callSession();
      if (session) {
        session.isMuted = !session.isMuted;
        this.callSessionSubject.next({ ...session });
      }
    }
  }

  toggleSpeaker(): void {
    const session = this.callSession();
    if (session) {
      session.isSpeakerOn = !session.isSpeakerOn;
      this.callSessionSubject.next({ ...session });
      // In a real app, this would control the audio output device
    }
  }

  toggleHold(): void {
    const session = this.callSession();
    if (session) {
      session.isOnHold = !session.isOnHold;
      this.callSessionSubject.next({ ...session });
      
      if (this.peerConnection) {
        // In a real app, this would pause/resume media streams
      }
    }
  }

  toggleScreenShare(): void {
    const session = this.callSession();
    if (session) {
      session.isScreenSharing = !session.isScreenSharing;
      this.callSessionSubject.next({ ...session });
      
      if (session.isScreenSharing) {
        this.startScreenShare();
      } else {
        this.stopScreenShare();
      }
    }
  }

  addParticipant(userId: string): Observable<{ success: boolean }> {
    const session = this.callSession();
    if (!session) return throwError(() => new Error('No active call'));
    
    return this.http.post<{ success: boolean }>(`${this.API_URL}/calls/${session.id}/add-participant`, { userId });
  }

  removeParticipant(userId: string): Observable<{ success: boolean }> {
    const session = this.callSession();
    if (!session) return throwError(() => new Error('No active call'));
    
    return this.http.post<{ success: boolean }>(`${this.API_URL}/calls/${session.id}/remove-participant`, { userId });
  }

  // Device Management
  loadDevices(): void {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const callDevices: CallDevice[] = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput' | 'audiooutput' | 'videoinput',
        isDefault: device.deviceId === 'default'
      }));
      this.devicesSubject.next(callDevices);
    });
  }

  setAudioInput(deviceId: string): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.stop();
      });
      
      this.requestMediaPermissions('audio', deviceId);
    }
  }

  setAudioOutput(deviceId: string): void {
    // In a real app, this would set the audio output device
  }

  setVideoInput(deviceId: string): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.stop();
      });
      
      this.requestMediaPermissions('video', undefined, deviceId);
    }
  }

  // Media Management
  private async requestMediaPermissions(type: 'audio' | 'video', audioDeviceId?: string, videoDeviceId?: string): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        video: type === 'video' ? (videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true) : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      this.endCall('failed');
    }
  }

  private async startScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      if (this.peerConnection) {
        screenStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, screenStream);
        });
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }

  private stopScreenShare(): void {
    // In a real app, this would stop the screen share stream
  }

  // WebRTC Setup
  private setupSignalingSocket(): void {
    this.signalingSocket = new WebSocket(this.SIGNALING_URL);
    
    this.signalingSocket.onopen = () => {
    };
    
    this.signalingSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleSignalingMessage(message);
    };
    
    this.signalingSocket.onclose = () => {
      // Reconnect logic would go here
    };
  }

  private handleSignalingMessage(message: any): void {
    switch (message.type) {
      case 'call.incoming':
        this.handleIncomingCall(message.data);
        break;
      case 'call.accepted':
        this.handleCallAccepted(message.data);
        break;
      case 'call.rejected':
        this.handleCallRejected(message.data);
        break;
      case 'call.ended':
        this.handleCallEnded(message.data);
        break;
      case 'call.signal':
        this.handleCallSignal(message.data);
        break;
      case 'participant.joined':
        this.handleParticipantJoined(message.data);
        break;
      case 'participant.left':
        this.handleParticipantLeft(message.data);
        break;
    }
  }

  private handleIncomingCall(data: any): void {
    this.callSessionSubject.next(data.session);
    this.isRingingSubject.next(true);
    // In a real app, this would show an incoming call notification
  }

  private handleCallAccepted(data: any): void {
    this.isRingingSubject.next(false);
    this.isInCallSubject.next(true);
    this.updateCallStatus('connected');
  }

  private handleCallRejected(data: any): void {
    this.endCall('rejected');
  }

  private handleCallEnded(data: any): void {
    this.endCall('ended');
  }

  private handleCallSignal(data: any): void {
    if (this.peerConnection) {
      if (data.sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
      if (data.ice) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
      }
    }
  }

  private handleParticipantJoined(data: any): void {
    const currentParticipants = this.participants();
    const newParticipant: CallParticipant = {
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      isConnected: true,
      isMuted: false,
      isSpeaking: false,
      connectionQuality: 'good',
      audioLevel: 0
    };
    
    this.participantsSubject.next([...currentParticipants, newParticipant]);
  }

  private handleParticipantLeft(data: any): void {
    const currentParticipants = this.participants();
    this.participantsSubject.next(currentParticipants.filter(p => p.userId !== data.userId));
  }

  // Call Statistics
  private startCallTimer(): void {
    this.callTimer = window.setInterval(() => {
      const session = this.callSession();
      if (session && session.startTime) {
        const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
        session.duration = duration;
        this.callSessionSubject.next({ ...session });
      }
    }, 1000);
  }

  private startStatsCollection(): void {
    this.statsTimer = window.setInterval(() => {
      if (this.peerConnection) {
        this.peerConnection.getStats().then(stats => {
          const callStats: CallStats = {
            audioPacketsLost: 0,
            audioPacketsReceived: 0,
            audioPacketsSent: 0,
            videoPacketsLost: 0,
            videoPacketsReceived: 0,
            videoPacketsSent: 0,
            roundTripTime: 0,
            bandwidth: 0
          };
          
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
              callStats.audioPacketsReceived = report.packetsReceived || 0;
              callStats.audioPacketsLost = report.packetsLost || 0;
            }
            if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
              callStats.audioPacketsSent = report.packetsSent || 0;
            }
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              callStats.roundTripTime = report.currentRoundTripTime || 0;
            }
          });
          
          this.statsSubject.next(callStats);
        });
      }
    }, 5000);
  }

  // Utility Methods
  private updateCallStatus(status: CallSession['status']): void {
    const session = this.callSession();
    if (session) {
      session.status = status;
      this.callSessionSubject.next({ ...session });
    }
  }

  private cleanupCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = undefined;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = undefined;
    }
    
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = undefined;
    }
    
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = undefined;
    }
    
    this.callSessionSubject.next(null);
    this.participantsSubject.next([]);
    this.statsSubject.next(null);
    this.isInCallSubject.next(false);
    this.isRingingSubject.next(false);
  }

  // Formatting Methods
  formatCallDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getConnectionQualityColor(quality: string): string {
    switch (quality) {
      case 'excellent': return 'text-success-600';
      case 'good': return 'text-primary-600';
      case 'fair': return 'text-warning-600';
      case 'poor': return 'text-error-600';
      default: return 'text-on-surface-variant';
    }
  }

  // Mock data for development
  getMockCallSession(): CallSession {
    return {
      id: 'call-1',
      participants: [
        {
          userId: 'user1',
          userName: 'John Doe',
          isConnected: true,
          isMuted: false,
          isSpeaking: true,
          connectionQuality: 'good',
          audioLevel: 0.7
        },
        {
          userId: 'user2',
          userName: 'Jane Smith',
          isConnected: true,
          isMuted: false,
          isSpeaking: false,
          connectionQuality: 'excellent',
          audioLevel: 0.2
        }
      ],
      initiator: this.currentUserId,
      status: 'connected',
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      duration: 300,
      type: 'audio',
      connectionQuality: 'good',
      isMuted: false,
      isSpeakerOn: true,
      isOnHold: false,
      isScreenSharing: false
    };
  }
}
