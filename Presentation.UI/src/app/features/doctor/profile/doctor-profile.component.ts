import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
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

  public activeTab = signal<'personal' | 'chamber' | 'security'>('personal');

  public doctorInfo = signal({
    name: 'Dr. Arnob-MediPos',
    title: 'MBBS, MD (Internal Medicine)',
    specialty: 'Internal Medicine Specialist',
    regNo: 'BMDC-2024-XXXX',
    email: 'dr.arnob@example.com',
    phone: '+880 1700 000000',
    bio: 'Dedicated medical professional with over 10 years of experience in internal medicine and patient care.'
  });

  public chamberInfo = signal({
    clinicName: 'MediPos Health Center',
    address: '123 Health Ave, Dhaka, Bangladesh',
    contact: '+880 1900 111222',
    startTime: '10:00 AM',
    endTime: '08:00 PM',
    offDay: 'Friday'
  });

  ngOnInit(): void { }

  setTab(tab: 'personal' | 'chamber' | 'security'): void {
    this.activeTab.set(tab);
  }

  savePersonal(): void {
    this.notification.success('Success', 'Personal profile updated successfully');
  }

  saveChamber(): void {
    this.notification.success('Success', 'Chamber details updated successfully');
  }

  changePassword(): void {
    this.notification.info('Security', 'Password change request submitted');
  }
}
