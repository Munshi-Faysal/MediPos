import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PatientDetailsViewModel,
  PatientDto,
  PatientService,
  PatientViewModel
} from '../../../core/services/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { confirmAppAction } from '../../../core/utils/app-alert';

export interface Patient {
  id: number;
  encryptedId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: Date | null;
  status: 'Active' | 'Inactive';
  bloodGroup: string;
  address: string;
  image?: string;
  weight?: string;
  height?: string;
  bp?: string;
  totalVisits: number;
  prescriptionCount: number;
  nextAppointment: Date | null;
  medicalHistory: VisitRecord[];
}

export interface VisitRecord {
  date: Date;
  diagnosis: string;
  doctor: string;
  status: string;
  prescriptionEncryptedId?: string;
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);

  currentView: 'list' | 'create' | 'view' = 'list';
  searchTerm = '';
  selectedPatient: Patient | null = null;
  isEditing = false;
  isLoading = false;
  isListLoading = false;
  isDetailsLoading = false;
  deletingPatientId: string | null = null;
  errorMessage = '';
  formError = '';

  readonly pageSize = 50;
  currentPage = 1;

  newPatient: Partial<Patient> = this.emptyPatient();
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  ngOnInit(): void {
    this.loadPatients();
  }

  get paginatedPatients(): Patient[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPatients.length / this.pageSize));
  }

  get resultStart(): number {
    return this.filteredPatients.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get resultEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPatients.length);
  }

  loadPatients(): void {
    this.isListLoading = true;
    this.errorMessage = '';

    this.patientService.getAllPatients(1000).subscribe({
      next: (data) => {
        this.patients = (data || []).map(patient => this.mapPatient(patient));
        this.filterPatients();
        this.isListLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.errorMessage = 'Patients could not be loaded. Please try again.';
        this.isListLoading = false;
      }
    });
  }

  filterPatients(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredPatients = !term
      ? [...this.patients]
      : this.patients.filter(patient =>
          patient.name.toLowerCase().includes(term) ||
          patient.phone.toLowerCase().includes(term) ||
          patient.email.toLowerCase().includes(term)
        );
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  showList(): void {
    this.currentView = 'list';
    this.selectedPatient = null;
    this.newPatient = this.emptyPatient();
    this.isEditing = false;
    this.formError = '';
    this.errorMessage = '';
  }

  showCreate(): void {
    this.currentView = 'create';
    this.isEditing = false;
    this.formError = '';
    this.newPatient = this.emptyPatient();
  }

  showEdit(patient: Patient): void {
    this.currentView = 'create';
    this.isEditing = true;
    this.formError = '';
    this.newPatient = { ...patient };
  }

  showDetails(patient: Patient): void {
    this.selectedPatient = patient;
    this.currentView = 'view';
    this.isDetailsLoading = true;
    this.errorMessage = '';

    this.patientService.getPatientDetails(patient.encryptedId).subscribe({
      next: (details) => {
        this.selectedPatient = this.mapPatientDetails(details);
        this.isDetailsLoading = false;
      },
      error: (error) => {
        console.error('Error loading patient details:', error);
        this.errorMessage = 'Patient details could not be loaded. Please try again.';
        this.isDetailsLoading = false;
      }
    });
  }

  createPatient(): void {
    if (this.isLoading || !this.validatePatient()) return;

    this.isLoading = true;
    this.formError = '';
    const dto: PatientDto = {
      name: this.newPatient.name!.trim(),
      age: Number(this.newPatient.age || 0),
      gender: this.newPatient.gender || 'Male',
      phone: this.newPatient.phone!.trim(),
      email: this.newPatient.email?.trim() || '',
      bloodGroup: this.newPatient.bloodGroup || '',
      address: this.newPatient.address?.trim() || '',
      image: this.newPatient.image
    };

    if (this.isEditing && this.newPatient.encryptedId) {
      dto.encryptedId = this.newPatient.encryptedId;
      this.patientService.updatePatient(dto).subscribe({
        next: () => this.handleSaveSuccess('Patient updated successfully.'),
        error: (error) => this.handleSaveError(error, 'Patient could not be updated.')
      });
      return;
    }

    this.patientService.createPatient(dto).subscribe({
      next: () => this.handleSaveSuccess('Patient added successfully.'),
      error: (error) => this.handleSaveError(error, 'Patient could not be added.')
    });
  }

  async deletePatient(patient: Patient): Promise<void> {
    const confirmed = await confirmAppAction({
      title: 'Remove patient?',
      text: `${patient.name} will be removed from the active patient list. Medical history will be preserved.`,
      confirmButtonText: 'Yes, remove'
    });

    if (!confirmed) return;

    this.deletingPatientId = patient.encryptedId;
    this.patientService.deletePatient(patient.encryptedId).subscribe({
      next: () => {
        this.patients = this.patients.filter(item => item.encryptedId !== patient.encryptedId);
        this.filterPatients();
        this.deletingPatientId = null;
        this.notification.success('Success', 'Patient removed successfully.');
      },
      error: (error) => {
        console.error('Error deleting patient:', error);
        this.deletingPatientId = null;
        this.notification.error('Error', 'Patient could not be removed.');
      }
    });
  }

  initials(patient: Patient): string {
    return patient.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'P';
  }

  private emptyPatient(): Partial<Patient> {
    return { status: 'Active', gender: 'Male', bloodGroup: '' };
  }

  private mapPatient(patient: PatientViewModel): Patient {
    return {
      id: patient.id,
      encryptedId: patient.encryptedId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender || 'Other',
      phone: patient.phone,
      email: patient.email || '',
      lastVisit: patient.lastVisit ? new Date(patient.lastVisit) : null,
      status: patient.isActive ? 'Active' : 'Inactive',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      image: patient.image || undefined,
      totalVisits: 0,
      prescriptionCount: 0,
      nextAppointment: null,
      medicalHistory: []
    };
  }

  private mapPatientDetails(details: PatientDetailsViewModel): Patient {
    const patient = this.mapPatient(details);
    return {
      ...patient,
      weight: details.latestWeight || undefined,
      totalVisits: details.totalVisits || 0,
      prescriptionCount: details.prescriptionCount || 0,
      nextAppointment: details.nextAppointment ? new Date(details.nextAppointment) : null,
      medicalHistory: (details.visitHistory || []).map(visit => ({
        date: new Date(visit.date),
        diagnosis: visit.diagnosis || '—',
        doctor: visit.doctor || '—',
        status: visit.status,
        prescriptionEncryptedId: visit.prescriptionEncryptedId
      }))
    };
  }

  private validatePatient(): boolean {
    const age = Number(this.newPatient.age || 0);
    if (!this.newPatient.name?.trim()) {
      this.formError = 'Full name is required.';
      return false;
    }
    if (!this.newPatient.phone?.trim()) {
      this.formError = 'Phone number is required.';
      return false;
    }
    if (age < 0 || age > 130) {
      this.formError = 'Age must be between 0 and 130.';
      return false;
    }
    if (this.newPatient.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newPatient.email.trim())) {
      this.formError = 'Enter a valid email address.';
      return false;
    }
    this.formError = '';
    return true;
  }

  private handleSaveSuccess(message: string): void {
    this.isLoading = false;
    this.notification.success('Success', message);
    this.showList();
    this.loadPatients();
  }

  private handleSaveError(error: any, fallback: string): void {
    console.error(fallback, error);
    this.isLoading = false;
    this.formError = error?.error?.message || fallback;
    this.notification.error('Error', this.formError);
  }
}
