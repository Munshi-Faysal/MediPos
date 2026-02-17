import { Component, Input } from '@angular/core';

import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-billing-date-reminder',
  standalone: true,
  imports: [],
  templateUrl: './billing-date-reminder.component.html',
  styleUrls: ['./billing-date-reminder.component.scss']
})
export class BillingDateReminderComponent {
  @Input() doctors: Doctor[] = [];
  @Input() warningDays = 7;

  getUpcomingBilling(): Doctor[] {
    const today = new Date();
    return this.doctors.filter(doctor => {
      const billing = new Date(doctor.billingDate);
      const daysUntilBilling = Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilBilling <= this.warningDays && daysUntilBilling >= 0;
    });
  }

  getDaysUntilBilling(doctor: Doctor): number {
    const today = new Date();
    const billing = new Date(doctor.billingDate);
    return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
