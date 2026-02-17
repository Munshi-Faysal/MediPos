import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Doctor } from '../../../../core/models/doctor.model';
import { Prescription } from '../../../../core/models/prescription.model';
import { DoctorService } from '../../../../core/services/doctor.service';
import { PrescriptionService } from '../../../../core/services/prescription.service';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.scss']
})
export class DoctorDetailComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  doctor: Doctor | null = null;
  prescriptions: Prescription[] = [];
  loading = false;
  deleting = false;
  loadingPrescriptions = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadDoctor(params['id']);
        this.loadPrescriptions(params['id']);
      }
    });
  }

  loadDoctor(id: string): void {
    this.loading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load doctor. Please try again.');
        this.router.navigate(['/admin/doctors']);
      }
    });
  }


  loadPrescriptions(doctorId: string): void {
    this.loadingPrescriptions = true;
    this.prescriptionService.getPrescriptionsByDoctor(doctorId).subscribe({
      next: (prescriptions: any) => {
        this.prescriptions = prescriptions;
        this.loadingPrescriptions = false;
      },
      error: () => {
        this.loadingPrescriptions = false;
      }
    });
  }

  onEdit(): void {
    if (this.doctor) {
      this.router.navigate(['/admin/doctors', this.doctor.id, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.doctor) return;

    if (confirm(`Are you sure you want to delete ${this.doctor.name}? This action cannot be undone.`)) {
      this.deleting = true;
      this.doctorService.deleteDoctor(this.doctor.id).subscribe({
        next: () => {
          this.deleting = false;
          this.router.navigate(['/admin/doctors']);
        },
        error: () => {
          this.deleting = false;
          alert('Failed to delete doctor. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isLicenseExpiring(): boolean {
    if (!this.doctor) return false;
    const expiry = new Date(this.doctor.licenseExpiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }

  isBillingUpcoming(): boolean {
    if (!this.doctor) return false;
    const billing = new Date(this.doctor.billingDate);
    const today = new Date();
    const daysUntilBilling = Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilBilling <= 7 && daysUntilBilling >= 0;
  }

  getDaysUntilExpiry(): number {
    if (!this.doctor) return 0;
    const expiry = new Date(this.doctor.licenseExpiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysUntilBilling(): number {
    if (!this.doctor) return 0;
    const billing = new Date(this.doctor.billingDate);
    const today = new Date();
    return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  viewPrescription(prescriptionId: string): void {
    this.router.navigate(['/admin/prescriptions', prescriptionId]);
  }
}
