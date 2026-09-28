import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorProfile } from '../../../core/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit {
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private doctorService = inject(DoctorService);

  private currentProfile: DoctorProfile | null = null;

  public activeTab = signal<'personal' | 'password'>('personal');
  public isLoading = signal(true);
  public isSaving = signal(false);
  public isChangingPassword = signal(false);
  public loadError = signal('');

  public doctorInfo = signal({
    name: '',
    title: '',
    specialty: '',
    regNo: '',
    email: '',
    phone: '',
    bio: ''
  });

  public securityInfo = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.doctorService.getCurrentProfile().subscribe({
      next: profile => {
        this.currentProfile = profile;
        this.updateForms(profile);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load doctor profile', error);
        const message = error?.error?.message || 'Failed to load your profile data. Please try again.';
        this.loadError.set(message);
        this.notification.error('Profile unavailable', message);
        this.isLoading.set(false);
      }
    });
  }

  savePersonal(): void {
    if (!this.currentProfile || this.isSaving()) return;

    const info = this.doctorInfo();
    if (!info.name.trim() || !info.regNo.trim() || !info.email.trim() || !info.phone.trim()) {
      this.notification.warning('Missing information', 'Name, registration number, email, and phone are required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(info.email.trim())) {
      this.notification.warning('Invalid email', 'Please enter a valid contact email address.');
      return;
    }

    this.saveProfile({
      ...this.currentProfile,
      name: info.name,
      title: info.title,
      specialization: info.specialty,
      licenseNumber: info.regNo,
      email: info.email,
      phone: info.phone,
      bio: info.bio
    }, 'Professional information updated successfully.');
  }

  changePassword(): void {
    if (this.isChangingPassword()) return;

    const info = this.securityInfo();
    if (!info.currentPassword || !info.newPassword || !info.confirmPassword) {
      this.notification.warning('Missing information', 'Please complete all password fields.');
      return;
    }
    if (info.newPassword.length < 8 ||
        !/[a-z]/.test(info.newPassword) ||
        !/[A-Z]/.test(info.newPassword) ||
        !/\d/.test(info.newPassword) ||
        !/[^A-Za-z0-9]/.test(info.newPassword)) {
      this.notification.warning('Weak password', 'Use at least 8 characters with uppercase, lowercase, number, and symbol.');
      return;
    }
    if (info.newPassword !== info.confirmPassword) {
      this.notification.warning('Password mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (info.currentPassword === info.newPassword) {
      this.notification.warning('Choose a new password', 'The new password must be different from the current password.');
      return;
    }

    this.isChangingPassword.set(true);
    this.authService.changePassword(info.currentPassword, info.newPassword).subscribe({
      next: () => {
        this.securityInfo.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.notification.success('Password updated', 'Your password was changed successfully.');
        this.isChangingPassword.set(false);
      },
      error: error => {
        const response = error?.error;
        const message = Array.isArray(response) && typeof response[0]?.description === 'string'
          ? response[0].description
          : typeof response?.message === 'string'
            ? response.message
            : 'Please check your current password and try again.';
        this.notification.error('Password not updated', message);
        this.isChangingPassword.set(false);
      }
    });
  }

  private saveProfile(profile: DoctorProfile, successMessage: string): void {
    this.isSaving.set(true);
    this.doctorService.updateCurrentProfile(profile).subscribe({
      next: updatedProfile => {
        this.currentProfile = updatedProfile;
        this.updateForms(updatedProfile);
        this.notification.success('Saved', successMessage);
        this.isSaving.set(false);
      },
      error: error => {
        console.error('Doctor profile update failed', error);
        const message = error?.error?.message || 'Failed to save profile changes. Please try again.';
        this.notification.error('Save failed', message);
        this.isSaving.set(false);
      }
    });
  }

  private updateForms(profile: DoctorProfile): void {
    this.doctorInfo.set({
      name: profile.name || '',
      title: profile.title || '',
      specialty: profile.specialization || '',
      regNo: profile.licenseNumber || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || ''
    });
  }
}
