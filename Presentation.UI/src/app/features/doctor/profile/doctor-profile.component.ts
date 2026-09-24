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

  public activeTab = signal<'personal' | 'chamber' | 'security'>('personal');
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

  public chamberInfo = signal({
    clinicName: '',
    address: '',
    contact: '',
    startTime: '',
    endTime: '',
    offDay: ''
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

  setTab(tab: 'personal' | 'chamber' | 'security'): void {
    this.activeTab.set(tab);
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

  saveChamber(): void {
    if (!this.currentProfile || this.isSaving()) return;

    const info = this.chamberInfo();
    this.saveProfile({
      ...this.currentProfile,
      clinicName: info.clinicName,
      chamberAddress: info.address,
      chamberContact: info.contact,
      startTime: info.startTime,
      endTime: info.endTime,
      offDay: info.offDay
    }, 'Chamber details updated successfully.');
  }

  changePassword(): void {
    if (this.isChangingPassword()) return;

    const info = this.securityInfo();
    if (!info.currentPassword || !info.newPassword || !info.confirmPassword) {
      this.notification.warning('Missing information', 'Please complete all password fields.');
      return;
    }
    if (info.newPassword.length < 8) {
      this.notification.warning('Weak password', 'The new password must be at least 8 characters long.');
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
        console.error('Password update failed', error);
        this.notification.error('Password not updated', 'Please check your current password and password requirements.');
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

    this.chamberInfo.set({
      clinicName: profile.clinicName || '',
      address: profile.chamberAddress || '',
      contact: profile.chamberContact || '',
      startTime: profile.startTime || '',
      endTime: profile.endTime || '',
      offDay: profile.offDay || ''
    });
  }
}
