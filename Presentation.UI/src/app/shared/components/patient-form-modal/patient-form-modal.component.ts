import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Patient, Gender } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './patient-form-modal.component.html',
  styleUrls: ['./patient-form-modal.component.scss']
})
export class PatientFormModalComponent {
  private fb = inject(FormBuilder);

  @Input() showModal = false;
  @Output() patientCreated = new EventEmitter<Patient>();
  @Output() closeModal = new EventEmitter<void>();

  patientForm!: FormGroup;
  genders = Object.values(Gender);

  constructor() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      gender: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      email: ['', [Validators.email]],
      address: [''],
      medicalHistory: ['']
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;
      const patient: Patient = {
        id: '',
        name: formValue.name,
        age: formValue.age,
        gender: formValue.gender,
        phone: formValue.phone,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        medicalHistory: formValue.medicalHistory || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.patientCreated.emit(patient);
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
    this.patientForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
