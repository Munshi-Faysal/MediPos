import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, PatientDto, PatientViewModel } from '../../../core/services/patient.service';

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

  currentView: 'list' | 'create' | 'view' = 'list';
  searchTerm = '';
  selectedPatient: Patient | null = null;

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
        const data = res.data || [];
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
  }

  showCreate() {
    this.currentView = 'create';
    this.newPatient = { status: 'Active', gender: 'Male', bloodGroup: 'A+' }; // Reset form
  }

  showDetails(patient: Patient) {
    this.selectedPatient = patient;
    this.currentView = 'view';
  }

  // Create Action
  createPatient() {
    if (!this.newPatient.name || !this.newPatient.phone) return;

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

    this.patientService.createPatient(dto).subscribe({
      next: () => {
        this.loadPatients();
        this.showList();
      },
      error: (err: any) => console.error('Error creating patient:', err)
    });
  }
}
