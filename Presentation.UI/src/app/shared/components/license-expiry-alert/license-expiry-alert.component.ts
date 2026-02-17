import { Component, Input } from '@angular/core';

import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-license-expiry-alert',
  standalone: true,
  imports: [],
  templateUrl: './license-expiry-alert.component.html',
  styleUrls: ['./license-expiry-alert.component.scss']
})
export class LicenseExpiryAlertComponent {
  @Input() doctors: Doctor[] = [];
  @Input() warningDays = 30;

  getExpiringLicenses(): Doctor[] {
    const today = new Date();
    return this.doctors.filter(doctor => {
      const expiry = new Date(doctor.licenseExpiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= this.warningDays && daysUntilExpiry >= 0;
    });
  }

  getDaysUntilExpiry(doctor: Doctor): number {
    const today = new Date();
    const expiry = new Date(doctor.licenseExpiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
