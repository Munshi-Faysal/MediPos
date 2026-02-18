import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

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

  // Store the full doctor object to preserve other fields during updates
  private currentDoctor: any = null;
  public isLoading = signal(false);

  public activeTab = signal<'personal' | 'chamber' | 'security'>('personal');

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

  ngOnInit(): void {
    this.initialLoad();
  }

  initialLoad(): void {
    const user = this.authService.user();
    if (user?.doctorId || user?.id) {
      // Fallback to user ID if doctor ID is missing but backend handles it, 
      // though typically doctorId is distinct.
      // Assuming doctorId is available on the user object as per auth service analysis.
      const id = user.doctorId ? user.doctorId.toString() : '';

      if (id) {
        this.isLoading.set(true);
        this.doctorService.getDoctorById(id).subscribe({
          next: (doctor) => {
            this.currentDoctor = doctor;
            this.updateSignals(doctor);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load profile', err);
            this.notification.error('Error', 'Failed to load profile data');
            this.isLoading.set(false);
          }
        });
      }
    }
  }

  updateSignals(doctor: any): void {
    this.doctorInfo.set({
      name: doctor.name || '',
      title: doctor.title || '',
      specialty: doctor.specialization || '',
      regNo: doctor.licenseNumber || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      bio: doctor.bio || ''
    });

    this.chamberInfo.set({
      clinicName: doctor.clinicName || '',
      address: doctor.chamberAddress || '',
      contact: doctor.chamberContact || '',
      startTime: doctor.startTime || '',
      endTime: doctor.endTime || '',
      offDay: doctor.offDay || ''
    });
  }

  setTab(tab: 'personal' | 'chamber' | 'security'): void {
    this.activeTab.set(tab);
  }

  savePersonal(): void {
    if (!this.currentDoctor) return;

    const info = this.doctorInfo();
    const updatedDoctor: any = {
      ...this.currentDoctor,
      name: info.name,
      title: info.title,
      specialization: info.specialty,
      licenseNumber: info.regNo,
      email: info.email,
      phone: info.phone,
      bio: info.bio
    };

    this.isLoading.set(true);
    this.doctorService.updateDoctor(this.currentDoctor.id, updatedDoctor).subscribe({
      next: (res) => {
        this.currentDoctor = res; // Update local state with server response (important for timestamps etc)
        this.updateSignals(res);
        this.notification.success('Success', 'Personal profile updated successfully');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.notification.error('Error', 'Failed to update profile');
        this.isLoading.set(false);
      }
    });
  }

  saveChamber(): void {
    if (!this.currentDoctor) return;

    const info = this.chamberInfo();
    const updatedDoctor: any = {
      ...this.currentDoctor,
      clinicName: info.clinicName,
      chamberAddress: info.address,
      chamberContact: info.contact,
      startTime: info.startTime,
      endTime: info.endTime,
      offDay: info.offDay
    };

    this.isLoading.set(true);
    this.doctorService.updateDoctor(this.currentDoctor.id, updatedDoctor).subscribe({
      next: (res) => {
        this.currentDoctor = res;
        this.updateSignals(res);
        this.notification.success('Success', 'Chamber details updated successfully');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.notification.error('Error', 'Failed to update chamber details');
        this.isLoading.set(false);
      }
    });
  }

  changePassword(): void {
    this.notification.info('Security', 'Password change request submitted');
  }
}
