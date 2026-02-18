import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, PatientDto, PatientViewModel } from '../../../core/services/patient.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface Patient {
  id: number;
  encryptedId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: Date;
  status: string;
  bloodGroup: string;
  address: string;
  image?: string;
  weight?: string;
  height?: string;
  bp?: string;
  medicalHistory?: VisitRecord[];
}

export interface VisitRecord {
  date: Date;
  diagnosis: string;
  doctor: string;
  prescriptionId: string;
  status: 'Completed' | 'Follow-up';
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  private patientService = inject(PatientService);
  private notification = inject(NotificationService);

  currentView: 'list' | 'create' | 'view' = 'list';
  searchTerm = '';
  selectedPatient: Patient | null = null;
  isEditing = false;
  isLoading = false;

  // Form Model
  newPatient: Partial<Patient> = {
    status: 'Active',
    gender: 'Male',
    bloodGroup: 'A+'
  };

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getAllPatients().subscribe({
      next: (res: any) => {
        const data = res || [];
        this.patients = data.map((p: PatientViewModel) => ({
          id: 0,
          encryptedId: p.encryptedId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          email: p.email || '',
          lastVisit: p.lastVisit ? new Date(p.lastVisit) : new Date(),
          status: 'Active', // Default since ViewModel might not have it
          bloodGroup: p.bloodGroup || 'N/A',
          address: p.address || ''
        }));
        this.filterPatients();
      },
      error: (err: any) => console.error('Error loading patients:', err)
    });
  }

  filterPatients() {
    if (!this.searchTerm) {
      this.filteredPatients = this.patients;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  }

  // View Navigation
  showList() {
    this.currentView = 'list';
    this.selectedPatient = null;
    this.newPatient = { status: 'Active', gender: 'Male', bloodGroup: 'A+' };
    this.isEditing = false;
  }

  showCreate() {
    this.currentView = 'create';
    this.isEditing = false;
    this.newPatient = { status: 'Active', gender: 'Male', bloodGroup: 'A+' }; // Reset form
  }

  showEdit(patient: Patient) {
    this.currentView = 'create';
    this.isEditing = true;
    this.newPatient = { ...patient };
  }

  showDetails(patient: Patient) {
    this.selectedPatient = patient;
    this.currentView = 'view';
  }

  // Create/Update Action
  createPatient() {
    if (!this.newPatient.name || !this.newPatient.phone || this.isLoading) return;

    this.isLoading = true;
    const dto: PatientDto = {
      name: this.newPatient.name!,
      age: this.newPatient.age || 0,
      gender: this.newPatient.gender || 'Male',
      phone: this.newPatient.phone!,
      email: this.newPatient.email || '',
      bloodGroup: this.newPatient.bloodGroup || 'A+',
      address: this.newPatient.address || '',
      image: this.newPatient.image
    };

    if (this.isEditing && this.newPatient.encryptedId) {
      dto.encryptedId = this.newPatient.encryptedId;
      dto.id = this.newPatient.encryptedId; // Alias for safety

      this.patientService.updatePatient(dto).subscribe({
        next: () => {
          this.notification.success('Success', 'Patient updated successfully');
          this.isLoading = false;
          this.loadPatients();
          this.showList();
        },
        error: (err: any) => {
          console.error('Error updating patient:', err);
          this.notification.error('Error', 'Failed to update patient');
          this.isLoading = false;
        }
      });
    } else {
      this.patientService.createPatient(dto).subscribe({
        next: () => {
          this.notification.success('Success', 'Patient added successfully');
          this.isLoading = false;
          this.loadPatients();
          this.showList();
        },
        error: (err: any) => {
          console.error('Error creating patient:', err);
          this.notification.error('Error', 'Failed to add patient');
          this.isLoading = false;
        }
      });
    }
  }
  deletePatient(patient: Patient) {
    if (confirm(`Are you sure you want to delete ${patient.name}? This action cannot be undone.`)) {
      this.patientService.deletePatient(patient.encryptedId).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (err: any) => {
          console.error('Error deleting patient:', err);
          alert('Failed to delete patient. Please try again.');
        }
      });
    }
  }
}
