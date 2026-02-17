import { Component, OnInit, signal, inject } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { Medicine } from '../../../core/models/medicine.model';
import { Prescription, PrescriptionStatus } from '../../../core/models/prescription.model';
import { PatientService } from '../../../core/services/patient.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientSearchComponent } from '../../../shared/components/patient-search/patient-search.component';
import { MedicineAutocompleteComponent } from '../../../shared/components/medicine-autocomplete/medicine-autocomplete.component';

@Component({
  selector: 'app-quick-prescription',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PatientSearchComponent,
    MedicineAutocompleteComponent
],
  templateUrl: './quick-prescription.component.html',
  styleUrls: ['./quick-prescription.component.scss']
})
export class QuickPrescriptionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private medicineService = inject(MedicineService);
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);

  quickPrescriptionForm!: FormGroup;
  selectedPatient = signal<Patient | null>(null);
  selectedMedicines = signal<Medicine[]>([]);
  submitting = signal<boolean>(false);

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.quickPrescriptionForm = this.fb.group({
      diagnosis: ['', Validators.required],
      notes: [''],
      medicines: this.fb.array([])
    });
  }

  get medicinesFormArray(): FormArray {
    return this.quickPrescriptionForm.get('medicines') as FormArray;
  }

  onPatientSelected(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  onMedicineSelected(medicine: Medicine): void {
    if (!this.selectedMedicines().find(m => m.id === medicine.id)) {
      this.selectedMedicines.set([...this.selectedMedicines(), medicine]);
      this.addMedicineToForm(medicine);
    }
  }

  addMedicineToForm(medicine: Medicine): void {
    const medicineGroup = this.fb.group({
      medicineId: [medicine.id],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
      quantity: ['', Validators.required],
      instructions: ['']
    });
    this.medicinesFormArray.push(medicineGroup);
  }

  removeMedicine(index: number): void {
    const medicines = this.selectedMedicines();
    medicines.splice(index, 1);
    this.selectedMedicines.set([...medicines]);
    this.medicinesFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.quickPrescriptionForm.invalid || !this.selectedPatient() || this.selectedMedicines().length === 0) {
      return;
    }

    this.submitting.set(true);

    const formValue = this.quickPrescriptionForm.value;
    const prescription: Partial<Prescription> = {
      patientId: this.selectedPatient()!.id,
      diagnosis: formValue.diagnosis,
      notes: formValue.notes,
      prescriptionDate: new Date(),
      status: PrescriptionStatus.COMPLETED,
      medicines: formValue.medicines.map((med: any, index: number) => ({
        id: `pm_${Date.now()}_${index}`,
        medicineId: med.medicineId,
        medicine: this.selectedMedicines()[index],
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        quantity: parseInt(med.quantity) || 0,
        instructions: med.instructions || ''
      }))
    };

    this.prescriptionService.createPrescription(prescription as Prescription).subscribe({
      next: (createdPrescription) => {
        this.submitting.set(false);
        this.router.navigate(['/doctor/prescriptions', createdPrescription.id]);
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  resetForm(): void {
    this.selectedPatient.set(null);
    this.selectedMedicines.set([]);
    this.quickPrescriptionForm.reset();
    while (this.medicinesFormArray.length !== 0) {
      this.medicinesFormArray.removeAt(0);
    }
  }
}
