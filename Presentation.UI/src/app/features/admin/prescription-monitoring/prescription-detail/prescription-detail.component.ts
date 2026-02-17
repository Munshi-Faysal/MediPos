import { Component, OnInit, inject } from '@angular/core';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Prescription, PrescriptionStatus } from '../../../../core/models/prescription.model';
import { Patient } from '../../../../core/models/patient.model';
import { Doctor } from '../../../../core/models/doctor.model';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { PatientService } from '../../../../core/services/patient.service';
import { DoctorService } from '../../../../core/services/doctor.service';

@Component({
  selector: 'app-prescription-detail-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss']
})
export class PrescriptionDetailAdminComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  prescription: Prescription | null = null;
  patient: Patient | null = null;
  doctor: Doctor | null = null;
  loading = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPrescription(params['id']);
      }
    });
  }

  loadPrescription(id: string): void {
    this.loading = true;
    this.prescriptionService.getPrescriptionById(id).subscribe({
      next: (prescription) => {
        this.prescription = prescription;
        this.loadPatient(prescription.patientId);
        this.loadDoctor(prescription.doctorId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load prescription. Please try again.');
        this.router.navigate(['/admin/prescriptions']);
      }
    });
  }

  loadPatient(patientId: string): void {
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: () => {
        // Patient not found, continue without it
      }
    });
  }

  loadDoctor(doctorId: string): void {
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
      },
      error: () => {
        // Doctor not found, continue without it
      }
    });
  }

  onPrint(): void {
    window.print();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PrescriptionStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case PrescriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
