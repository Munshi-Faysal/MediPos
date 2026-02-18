import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PatientService } from '../../../core/services/patient.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { AuthService } from '../../../core/services/auth.service';
import { DrugDoseTemplateService } from '../../../core/services/drug-dose-template.service';
import { MedicineSearchComponent } from '../../../shared/components/medicine-search/medicine-search.component';
import { Medicine } from '../../../core/models/medicine.model';
import { Gender } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-quick-prescription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MedicineSearchComponent,
  ],
  templateUrl: './quick-prescription.component.html',
  styleUrls: ['./quick-prescription.component.scss']
})
export class QuickPrescriptionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private prescriptionService = inject(PrescriptionService);
  private authService = inject(AuthService);
  private drugDoseService = inject(DrugDoseTemplateService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Form
  form!: FormGroup;

  // State
  submitting = false;
  showMedicineSearch = false;
  currentDoctorId = '';

  // Patient search
  patientSearchQuery = '';
  patientResults = signal<any[]>([]);
  selectedPatient = signal<any | null>(null);
  showPatientDropdown = false;
  loadingPatients = false;
  private patientSearchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Dose templates for autocomplete
  doseTemplates = signal<string[]>([]);

  ngOnInit(): void {
    const user = this.authService.user();
    if (user?.doctorId) {
      this.currentDoctorId = user.doctorId.toString();
    }

    this.initForm();
    this.loadDoseTemplates();

    // Debounced patient search
    this.patientSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => this.performPatientSearch(query));
  }

  ngOnDestroy(): void {
    this.patientSearchSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      prescriptionDate: [new Date().toISOString().split('T')[0], Validators.required],
      patientName: ['', Validators.required],
      patientAge: [''],
      patientGender: [''],
      patientPhone: [''],
      patientAddress: [''],
      patientWeight: [''],
      chiefComplaint: [''],
      diagnosis: [''],
      advice: [''],
      notes: [''],
      medicines: this.fb.array([])
    });
  }

  get medicinesArray(): FormArray {
    return this.form.get('medicines') as FormArray;
  }

  // ─── Patient Search ────────────────────────────────────────────────────────

  onPatientSearchInput(query: string): void {
    this.patientSearchQuery = query;
    this.selectedPatient.set(null);
    this.patientSearchSubject.next(query);
  }

  private performPatientSearch(query: string): void {
    if (!query.trim()) {
      this.patientResults.set([]);
      this.showPatientDropdown = false;
      return;
    }
    this.loadingPatients = true;
    this.patientService.searchPatients(query, 8).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.patientResults.set(list);
        this.showPatientDropdown = list.length > 0;
        this.loadingPatients = false;
      },
      error: () => { this.loadingPatients = false; }
    });
  }

  selectPatient(patient: any): void {
    this.selectedPatient.set(patient);
    this.patientSearchQuery = patient.name;
    this.showPatientDropdown = false;
    this.form.patchValue({
      patientName: patient.name,
      patientAge: patient.age || '',
      patientGender: patient.gender || '',
      patientPhone: patient.phone || '',
      patientAddress: patient.address || '',
      patientWeight: patient.weight || ''
    });
  }

  clearPatient(): void {
    this.selectedPatient.set(null);
    this.patientSearchQuery = '';
    this.patientResults.set([]);
    this.form.patchValue({
      patientName: '', patientAge: '', patientGender: '',
      patientPhone: '', patientAddress: '', patientWeight: ''
    });
  }

  onPatientSearchBlur(): void {
    setTimeout(() => { this.showPatientDropdown = false; }, 200);
  }

  // ─── Medicine Management ───────────────────────────────────────────────────

  openMedicineSearch(): void {
    this.showMedicineSearch = true;
  }

  onMedicineSelected(medicine: Medicine): void {
    this.addMedicine(medicine.id, medicine);
    this.showMedicineSearch = false;
  }

  addMedicine(medicineId: string, medicine?: Medicine): void {
    const group = this.fb.group({
      medicineId: [medicineId, Validators.required],
      dosage: ['', Validators.required],
      frequency: [''],
      duration: ['', Validators.required],
      instructions: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      _medicine: [medicine || null]
    });
    this.medicinesArray.push(group);
  }

  removeMedicine(index: number): void {
    this.medicinesArray.removeAt(index);
  }

  getMedicineName(index: number): string {
    const med = this.medicinesArray.at(index).get('_medicine')?.value as Medicine;
    return med ? med.medicineName : 'Unknown Medicine';
  }

  getMedicineDetail(index: number): string {
    const med = this.medicinesArray.at(index).get('_medicine')?.value as Medicine;
    if (!med) return '';
    const parts = [med.form, med.variation].filter(Boolean);
    return parts.join(' · ');
  }

  // ─── Dose Templates ────────────────────────────────────────────────────────

  loadDoseTemplates(): void {
    this.drugDoseService.getActiveDrugDoseByDoctorId().subscribe({
      next: (doses) => this.doseTemplates.set(doses.map(d => d.name))
    });
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.medicinesArray.length === 0) {
      this.notification.error('Validation', 'Please add at least one medicine.');
      return;
    }
    if (!this.form.value.patientName?.trim()) {
      this.notification.error('Validation', 'Please enter or select a patient.');
      return;
    }

    this.submitting = true;
    const fv = this.form.value;
    const patient = this.selectedPatient();

    const medicines = fv.medicines.map((m: any) => ({
      Id: null,
      EncryptedId: null,
      MedicineEncryptedId: m.medicineId ? String(m.medicineId) : null,
      Dosage: m.dosage || '',
      Frequency: m.frequency || '',
      Duration: m.duration || '',
      Instructions: m.instructions || null,
      Quantity: m.quantity || 1,
      IsActive: true
    }));

    const dto: any = {
      Id: 0,
      EncryptedId: null,
      DoctorEncryptedId: this.currentDoctorId || null,
      PatientEncryptedId: patient?.encryptedId || null,
      AppointmentEncryptedId: null,
      PrescriptionDate: new Date(fv.prescriptionDate).toISOString(),
      PatientName: fv.patientName || null,
      PatientAge: fv.patientAge ? String(fv.patientAge) : null,
      PatientGender: fv.patientGender || null,
      PatientWeight: fv.patientWeight || null,
      PatientPhone: fv.patientPhone || null,
      PatientAddress: fv.patientAddress || null,
      PatientRegNo: null,
      ChiefComplaint: fv.chiefComplaint || null,
      OnExamination: null,
      Investigation: null,
      Advice: fv.advice || null,
      Diagnosis: fv.diagnosis || null,
      Disease: null,
      DrugHistory: null,
      Notes: fv.notes || null,
      Status: 'Draft',
      IsActive: true,
      Medicines: medicines
    };

    // If no existing patient, auto-create one first
    if (!patient?.encryptedId && fv.patientName) {
      const newPatient: any = {
        name: fv.patientName,
        phone: fv.patientPhone || '',
        age: fv.patientAge ? parseInt(fv.patientAge) : 0,
        gender: fv.patientGender || Gender.OTHER,
        address: fv.patientAddress || '',
        weight: fv.patientWeight || ''
      };
      this.patientService.createPatient(newPatient).subscribe({
        next: (created: any) => {
          dto.PatientEncryptedId = created?.encryptedId || created?.data?.encryptedId || null;
          this.savePrescription(dto);
        },
        error: () => {
          // Proceed without patient ID if creation fails
          this.savePrescription(dto);
        }
      });
    } else {
      this.savePrescription(dto);
    }
  }

  private savePrescription(dto: any): void {
    this.prescriptionService.createPrescription(dto).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.notification.success('Success', 'Prescription created successfully!');
        const id = res?.encryptedId || res?.data?.encryptedId || res?.id;
        if (id) {
          this.router.navigate(['/doctor/prescriptions', id]);
        } else {
          this.router.navigate(['/doctor/prescriptions']);
        }
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Quick prescription error:', err);
        this.notification.error('Error', 'Failed to create prescription. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      prescriptionDate: new Date().toISOString().split('T')[0],
      patientName: '', patientAge: '', patientGender: '',
      patientPhone: '', patientAddress: '', patientWeight: '',
      chiefComplaint: '', diagnosis: '', advice: '', notes: ''
    });
    while (this.medicinesArray.length) {
      this.medicinesArray.removeAt(0);
    }
    this.clearPatient();
  }
}
