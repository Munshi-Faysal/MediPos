import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CallService, CallSession, CallParticipant, CallDevice } from '../../../core/services/call.service';

@Component({
  selector: 'app-call-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.scss']
})
export class CallModalComponent {
  callService = inject(CallService);

  @Input() callSession: CallSession | null = null;
  @Input() isVisible = false;

  @Output() accept = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() end = new EventEmitter<void>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() toggleSpeaker = new EventEmitter<void>();
  @Output() toggleHold = new EventEmitter<void>();
  @Output() toggleScreenShare = new EventEmitter<void>();
  @Output() addParticipant = new EventEmitter<string>();

  public showDeviceSettings = signal(false);
  public showAddParticipant = signal(false);
  public newParticipantEmail = signal('');

  public remoteParticipant = computed(() => {
    return this.callSession?.participants[0] || null;
  });

  public remoteParticipantName = computed(() => {
    return this.remoteParticipant()?.userName || 'Unknown User';
  });

  public remoteParticipantInitials = computed(() => {
    const p = this.remoteParticipant();
    return p ? this.getParticipantInitials(p) : '??';
  });

  public audioInputDevices = computed(() => {
    return this.callService.devices().filter(d => d.kind === 'audioinput');
  });

  public audioOutputDevices = computed(() => {
    return this.callService.devices().filter(d => d.kind === 'audiooutput');
  });

  public callDuration = computed(() => {
    if (!this.callSession?.duration) return '00:00';
    return this.callService.formatCallDuration(this.callSession.duration);
  });

  public connectionQualityColor = computed(() => {
    if (!this.callSession) return 'text-on-surface-variant';
    return this.callService.getConnectionQualityColor(this.callSession.connectionQuality);
  });

  public isIncomingCall = computed(() => {
    return this.callSession?.status === 'ringing' && this.callSession.initiator !== 'current-user-id';
  });

  public isOutgoingCall = computed(() => {
    return this.callSession?.status === 'ringing' && this.callSession.initiator === 'current-user-id';
  });

  public isConnected = computed(() => {
    return this.callSession?.status === 'connected';
  });

  public isConnecting = computed(() => {
    return this.callSession?.status === 'connecting';
  });

  onAccept(): void {
    if (this.callSession) {
      this.accept.emit(this.callSession.id);
    }
  }

  onReject(): void {
    if (this.callSession) {
      this.reject.emit(this.callSession.id);
    }
  }

  onEnd(): void {
    this.end.emit();
  }

  onToggleMute(): void {
    this.toggleMute.emit();
  }

  onToggleSpeaker(): void {
    this.toggleSpeaker.emit();
  }

  onToggleHold(): void {
    this.toggleHold.emit();
  }

  onToggleScreenShare(): void {
    this.toggleScreenShare.emit();
  }

  onAddParticipant(): void {
    const email = this.newParticipantEmail().trim();
    if (email) {
      this.addParticipant.emit(email);
      this.newParticipantEmail.set('');
      this.showAddParticipant.set(false);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newParticipantEmail.set(target.value);
  }

  onDeviceChangeVal(event: Event, type: 'audio' | 'video'): void {
    const target = event.target as HTMLSelectElement;
    this.onDeviceChange(target.value, type);
  }

  onAudioOutputChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.callService.setAudioOutput(target.value);
  }

  onDeviceChange(deviceId: string, type: 'audio' | 'video'): void {
    if (type === 'audio') {
      this.callService.setAudioInput(deviceId);
    } else {
      this.callService.setVideoInput(deviceId);
    }
  }

  getParticipantInitials(participant: CallParticipant): string {
    return participant.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAudioLevelClass(level: number): string {
    if (level > 0.7) return 'audio-level-high';
    if (level > 0.3) return 'audio-level-medium';
    return 'audio-level-low';
  }

  trackByParticipantId(index: number, participant: CallParticipant): string {
    return participant.userId;
  }

  trackByDeviceId(index: number, device: CallDevice): string {
    return device.deviceId;
  }
}
