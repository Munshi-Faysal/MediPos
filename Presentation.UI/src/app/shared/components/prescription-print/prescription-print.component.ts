import { Component, Input } from '@angular/core';

import { Prescription } from '../../../core/models/prescription.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-prescription-print',
  standalone: true,
  imports: [],
  templateUrl: './prescription-print.component.html',
  styleUrls: ['./prescription-print.component.scss']
})
export class PrescriptionPrintComponent {
  @Input() prescription!: Prescription;
  @Input() patient?: Patient;
  @Input() doctor?: Doctor;
  @Input() clinicName = 'Medical Clinic';
  @Input() clinicAddress = '';
  @Input() clinicPhone = '';
  @Input() clinicEmail = '';
  today = new Date();

  get hasInstructions(): boolean {
    return this.prescription?.medicines?.some(m => !!m.instructions) ?? false;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onPrint(): void {
    window.print();
  }
}
