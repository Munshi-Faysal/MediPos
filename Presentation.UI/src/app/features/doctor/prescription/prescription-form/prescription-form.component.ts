import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Prescription, PrescriptionStatus, PrescriptionMedicine } from '../../../../core/models/prescription.model';
import { Medicine } from '../../../../core/models/medicine.model';
import { Patient, Gender } from '../../../../core/models/patient.model';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { PatientService } from '../../../../core/services/patient.service';
import { AppointmentService, AppointmentViewModel } from '../../../../core/services/appointment.service';
import { DrugDoseTemplateService } from '../../../../core/services/drug-dose-template.service';
import { DrugAdviceService } from '../../../../core/services/drug-advice.service';
import { DrugDurationTemplateService } from '../../../../core/services/drug-duration-template.service';
import { ChiefComplaintService } from '../../../../core/services/chief-complaint.service';
import { OnExaminationService } from '../../../../core/services/on-examination.service';
import { InvestigationService } from '../../../../core/services/investigation.service';
import { DiseaseService } from '../../../../core/services/disease.service';
import { MedicineSearchComponent } from '../../../../shared/components/medicine-search/medicine-search.component';
import { PatientFormModalComponent } from '../../../../shared/components/patient-form-modal/patient-form-modal.component';
import { PrescriptionHeaderComponent } from '../components/prescription-header/prescription-header.component';
import { PrescriptionBodyComponent } from '../components/prescription-body/prescription-body.component';
import { PrescriptionFooterComponent } from '../components/prescription-footer/prescription-footer.component';
import { PrescriptionSettingsService } from '../../../../core/services/prescription-settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  PrescriptionHeaderConfig, DEFAULT_HEADER_CONFIG,
  PrescriptionBodyConfig, DEFAULT_BODY_CONFIG,
  PrescriptionFooterConfig, DEFAULT_FOOTER_CONFIG
} from '../../../../core/models/prescription-settings.model';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MedicineSearchComponent,
    PatientFormModalComponent,
    PrescriptionHeaderComponent,
    PrescriptionBodyComponent,
    PrescriptionFooterComponent
  ],
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.scss']
})
export class PrescriptionFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private prescriptionService = inject(PrescriptionService);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private drugDoseService = inject(DrugDoseTemplateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private settingsService = inject(PrescriptionSettingsService);
  private authService = inject(AuthService);
  private drugAdviceService = inject(DrugAdviceService);
  private drugDurationTemplateService = inject(DrugDurationTemplateService);
  private chiefComplaintService = inject(ChiefComplaintService);
  private onExaminationService = inject(OnExaminationService);
  private investigationService = inject(InvestigationService);
  private diseaseService = inject(DiseaseService);

  prescriptionForm!: FormGroup;
  isEditMode = false;
  prescriptionId: string | null = null;
  isLoading = false;

  private patientSearchSubject = new Subject<string>();

  // Child Component Configs
  headerConfig: PrescriptionHeaderConfig = DEFAULT_HEADER_CONFIG;
  bodyConfig: PrescriptionBodyConfig = DEFAULT_BODY_CONFIG;
  footerConfig: PrescriptionFooterConfig = DEFAULT_FOOTER_CONFIG;
  submitting = false;
  showMedicineSearch = false;
  showPatientForm = false;

  // Patient Selection Mode
  selectionMode: 'patient' | 'appointment' = 'patient'; // Default to 'patient'

  // Patient Data
  patients = signal<Patient[]>([]);
  selectedPatient: Patient | null = null;
  loadingPatients = false;

  // Appointment Data
  appointments = signal<AppointmentViewModel[]>([]);
  selectedAppointment: AppointmentViewModel | null = null;
  loadingAppointments = false;

  // Dose Template Data
  doseTemplates = signal<string[]>([]);
  adviceTemplates = signal<string[]>([]);
  durationTemplates = signal<string[]>([]);
  ccTemplates = signal<string[]>([]);
  oeTemplates = signal<string[]>([]);
  ixTemplates = signal<string[]>([]);
  dxTemplates = signal<string[]>([]);

  // Current doctor ID from AuthService
  currentDoctorId = '';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    // Get current doctor ID
    const user = this.authService.user();
    if (user && user.doctorId) {
      // If the backend expects an encrypted string, we might need a way to get it.
      // But for now, let's at least avoid the 'doc_1' which is definitely wrong.
      this.currentDoctorId = user.doctorId.toString();
    }
    // Load Settings
    this.settingsService.getHeaderConfig().subscribe(c => this.headerConfig = c);
    this.settingsService.getBodyConfig().subscribe(c => {
      this.bodyConfig = c;
      // Add missing controls for dynamic sections
      if (this.bodyConfig.sections) {
        this.bodyConfig.sections.forEach(s => {
          let controlName = s.id;
          // Map known IDs to form control names
          if (s.id === 'cc') controlName = 'chiefComplaint';
          else if (s.id === 'oe') controlName = 'onExamination';
          else if (s.id === 'advice') controlName = 'advice';
          else if (s.id === 'ix') controlName = 'investigation';
          else if (s.id === 'diagnosis') controlName = 'diagnosis';
          else if (s.id === 'disease') controlName = 'disease';
          else if (s.id === 'dh') controlName = 'drugHistory';

          if (!this.prescriptionForm.contains(controlName)) {
            this.prescriptionForm.addControl(controlName, this.fb.control(''));
          }

          // Also handle toggle controls
          let toggleControlName = '';
          if (s.id === 'cc') toggleControlName = 'showChiefComplaint';
          else if (s.id === 'oe') toggleControlName = 'showOnExamination';
          else if (s.id === 'advice') toggleControlName = 'showAdvice';
          else if (s.id === 'ix') toggleControlName = 'showInvestigation';
          else if (s.id === 'diagnosis') toggleControlName = 'showDiagnosis';
          else if (s.id === 'disease') toggleControlName = 'showDisease';
          else if (s.id === 'dh') toggleControlName = 'showDrugHistory';

          if (toggleControlName && !this.prescriptionForm.contains(toggleControlName)) {
            this.prescriptionForm.addControl(toggleControlName, this.fb.control(false));
          }
        });
      }
    });
    this.settingsService.getFooterConfig().subscribe(c => this.footerConfig = c);

    this.loadPatients();
    this.loadDoseTemplates();
    this.loadAdviceTemplates();
    this.loadDurationTemplates();
    this.loadCcTemplates();
    this.loadOeTemplates();
    this.loadIxTemplates();
    this.loadDxTemplates();
    // this.loadAppointments(); // Load appointments initially or on mode switch

    // Setup debounced search
    this.patientSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performPatientSearch(query);
    });

    // Check for Edit Mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.prescriptionId = params['id'];
        this.loadPrescription();
      }
    });

    // Watch for mode changes to load data if needed
    // Assuming simple switch logic, logic can be added in setSelectionMode
  }

  ngOnDestroy(): void {
    this.patientSearchSubject.complete();
  }

  initForm(): void {
    this.prescriptionForm = this.fb.group({
      patientId: ['', [Validators.required]],
      appointmentId: [''], // Add appointmentId to form
      prescriptionDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      patientRegNo: [''],
      chiefComplaint: [''],
      onExamination: [''],
      investigation: [''],
      advice: [''],
      diagnosis: [''],
      disease: [''],
      drugHistory: [''],
      // Patient Details for Header (Editable)
      patientName: [''],
      patientAge: [''],
      patientGender: [''],
      patientWeight: [''],
      patientPhone: [''],
      patientAddress: [''],
      // Toggles for sections
      showChiefComplaint: [false],
      showOnExamination: [false],
      showInvestigation: [false],
      showAdvice: [false],
      showDiagnosis: [false],
      showDisease: [false],
      showDrugHistory: [false],
      medicines: this.fb.array([])
    });
  }

  get medicinesFormArray(): FormArray {
    return this.prescriptionForm.get('medicines') as FormArray;
  }

  // Set Mode
  setSelectionMode(mode: 'patient' | 'appointment'): void {
    this.selectionMode = mode;
    this.selectedPatient = null;
    this.selectedAppointment = null;
    this.prescriptionForm.patchValue({ patientId: '', appointmentId: '' });

    if (mode === 'patient') {
      this.loadPatients();
    } else {
      this.loadAppointments();
    }
  }

  loadPatients(): void {
    this.loadingPatients = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loadingPatients = false;
      },
      error: () => {
        this.loadingPatients = false;
      }
    });
  }

  loadDoseTemplates(): void {
    this.drugDoseService.getActiveDrugDoseByDoctorId().subscribe({
      next: (doses) => {
        this.doseTemplates.set(doses.map(d => d.name));
      }
    });
  }

  loadAdviceTemplates(): void {
    this.drugAdviceService.getActiveDrugAdvicesForCurrentDoctor().subscribe({
      next: (advices) => {
        this.adviceTemplates.set(advices.map(a => a.name));
      }
    });
  }

  loadDurationTemplates(): void {
    this.drugDurationTemplateService.getActiveDrugDurationTemplatesForCurrentDoctor().subscribe({
      next: (durations) => {
        this.durationTemplates.set(durations.map(d => d.name));
      }
    });
  }

  loadCcTemplates(): void {
    this.chiefComplaintService.getActiveChiefComplaintsForCurrentDoctor().subscribe({
      next: (responses) => {
        this.ccTemplates.set(responses.map(r => r.name));
      }
    });
  }

  loadOeTemplates(): void {
    this.onExaminationService.getActiveOnExaminationsForCurrentDoctor().subscribe({
      next: (responses) => {
        this.oeTemplates.set(responses.map(r => r.name));
      }
    });
  }

  loadIxTemplates(): void {
    this.investigationService.getActiveInvestigationsForCurrentDoctor().subscribe({
      next: (responses) => {
        this.ixTemplates.set(responses.map(r => r.name));
      }
    });
  }

  loadDxTemplates(): void {
    this.diseaseService.getActiveDiseasesForCurrentDoctor().subscribe({
      next: (responses) => {
        this.dxTemplates.set(responses.map(r => r.name));
      }
    });
  }

  loadAppointments(): void {
    this.loadingAppointments = true;
    // In a real scenario, you might want to filter by date or status (e.g., today's confirmed appointments)
    this.appointmentService.getAppointmentsByCurrentDoctor().subscribe({
      next: (response: any) => {
        // Adapt response if needed. Assuming response.data is the list or response is list
        const appointments = Array.isArray(response) ? response : (response.data || []);
        this.appointments.set(appointments);
        this.loadingAppointments = false;
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
        this.loadingAppointments = false;
      }
    });
  }

  loadPrescription(): void {
    if (!this.prescriptionId) return;

    this.isLoading = true;
    this.prescriptionService.getPrescriptionById(this.prescriptionId).subscribe({
      next: (prescription) => {
        // Create an object to track which sections should be shown
        const updates: any = {
          patientId: prescription.patientId,
          prescriptionDate: this.formatDateForInput(prescription.prescriptionDate),
          chiefComplaint: prescription.chiefComplaint || '',
          onExamination: prescription.onExamination || '',
          advice: prescription.advice || '',
          investigation: prescription.investigation || '',
          diagnosis: prescription.diagnosis || '',
          disease: prescription.disease || '',
          drugHistory: prescription.drugHistory || '',
          patientName: prescription.patientName || '',
          patientAge: prescription.patientAge || '',
          patientGender: prescription.patientGender || '',
          patientWeight: prescription.patientWeight || '',
          patientPhone: prescription.patientPhone || '',
          patientAddress: prescription.patientAddress || '',
          patientRegNo: prescription.patientRegNo || ''
        };

        // Auto-enable toggles if data exists
        if (prescription.chiefComplaint) updates['showChiefComplaint'] = true;
        if (prescription.onExamination) updates['showOnExamination'] = true;
        if (prescription.advice) updates['showAdvice'] = true;
        if (prescription.investigation) updates['showInvestigation'] = true;
        if (prescription.diagnosis) updates['showDiagnosis'] = true;
        if (prescription.disease) updates['showDisease'] = true;
        if (prescription.drugHistory) updates['showDrugHistory'] = true;

        this.prescriptionForm.patchValue(updates);

        // Reconstruct selectedPatient for UI components
        this.selectedPatient = {
          id: prescription.patientId,
          name: prescription.patientName || 'Unknown',
          phone: prescription.patientPhone || '',
          age: parseInt(prescription.patientAge as any) || 0,
          gender: prescription.patientGender as any,
          address: prescription.patientAddress || '',
          weight: prescription.patientWeight || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Load medicines
        prescription.medicines.forEach((med: any) => {
          // Construct a mock Medicine object from the DTO info to avoid "Unknown"
          const medicineMock: any = {
            id: med.medicineEncryptedId,
            medicineName: med.medicineName || 'Unknown',
            form: med.drugTypeName || '',
            variation: med.strengthName || ''
          };
          this.addMedicineToForm(med.medicineEncryptedId, med, medicineMock);
        });

        // Load dynamic sections
        if (prescription.dynamicSections) {
          Object.keys(prescription.dynamicSections).forEach(key => {
            if (!this.prescriptionForm.contains(key)) {
              this.prescriptionForm.addControl(key, this.fb.control(''));
            }
            this.prescriptionForm.get(key)?.patchValue(prescription.dynamicSections![key]);

            // Try to find and enable toggle for dynamic section
            // Assuming dynamic sections might map to 'show' + Key or just be handled if value exists
            // Since we don't have a direct map here without iterating config, we can try common patterns
            // or if the section ID is one of the known ones (handled above), or if it's a truly custom one.
            // For now, if the dynamic section has a value, we should ensure it's visible if we can find its toggle.
            // But 'dynamicSections' in DTO often maps to 'AdditionalInfo' etc. 
            // If it matches a know ID, we might need to toggle it.
          });
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load prescription. Please try again.');
        this.router.navigate(['/doctor/prescriptions']);
      }
    });
  }

  openMedicineSearch(): void {
    this.showMedicineSearch = true;
  }

  onMedicineSelected(medicine: Medicine): void {
    this.addMedicineToForm(medicine.id, null, medicine);
    this.showMedicineSearch = false;
  }

  addMedicineToForm(medicineId: string, existingMedicine?: PrescriptionMedicine | null, medicine?: Medicine): void {
    const medicineForm = this.fb.group({
      medicineId: [medicineId, [Validators.required]],
      dosage: [existingMedicine?.dosage || '', [Validators.required]],
      frequency: [existingMedicine?.frequency || ''],
      duration: [existingMedicine?.duration || '', [Validators.required]],
      instructions: [existingMedicine?.instructions || ''],
      quantity: [existingMedicine?.quantity || 1, [Validators.required, Validators.min(1)]],
      _medicine: [medicine || null] // Store medicine object for display
    });

    this.medicinesFormArray.push(medicineForm);
  }

  removeMedicine(index: number): void {
    this.medicinesFormArray.removeAt(index);
  }

  searchPatient(query: string): void {
    this.patientSearchSubject.next(query);
  }

  private performPatientSearch(query: string): void {
    if (query.trim()) {
      this.patientService.searchPatients(query).subscribe({
        next: (patients) => {
          this.patients.set(patients);
        }
      });
    } else {
      this.loadPatients();
    }
  }

  searchAppointment(query: string): void {
    // Implement filtering logic for appointments if API supports or client-side
    // simple client side filtering for demo
    if (!query.trim()) {
      // reload all
      this.loadAppointments();
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.appointments.update(apps => apps.filter(app =>
      app.patientName.toLowerCase().includes(lowerQuery) ||
      app.patientPhone.includes(lowerQuery) ||
      (app.encryptedId && app.encryptedId.toLowerCase().includes(lowerQuery))
    ));
  }


  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.prescriptionForm.patchValue({
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAddress: patient.address,
      patientRegNo: patient.id,
      patientWeight: patient.weight || ''
    });
    this.showPatientForm = false;
  }

  selectAppointment(appointment: AppointmentViewModel): void {
    this.selectedAppointment = appointment;
    // Map appointment patient details to a Patient object for display/logic compatibility
    this.selectedPatient = {
      id: appointment.patientId.toString(),
      name: appointment.patientName,
      phone: appointment.patientPhone,
      age: 0,
      gender: Gender.OTHER,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.prescriptionForm.patchValue({
      patientId: appointment.patientId,
      appointmentId: appointment.encryptedId,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientRegNo: appointment.patientId,
      patientAge: '',
      patientGender: '',
      patientAddress: '',
      patientWeight: ''
    });
  }


  openPatientForm(): void {
    this.showPatientForm = true;
  }

  onPatientCreated(patient: Patient): void {
    this.patientService.createPatient(patient).subscribe({
      next: (createdPatient) => {
        this.patients.update(patients => [...patients, createdPatient]);
        this.selectPatient(createdPatient);
        this.showPatientForm = false;
      },
      error: () => {
        alert('Failed to create patient. Please try again.');
      }
    });
  }

  hideHeaderOnPrint = false;

  onPreview(): void {
    this.hideHeaderOnPrint = false;
    this.ensureFilledSectionsVisible();
    setTimeout(() => window.print(), 500);
  }

  private ensureFilledSectionsVisible(): void {
    const sectionMap: { [key: string]: string } = {
      'chiefComplaint': 'showChiefComplaint',
      'onExamination': 'showOnExamination',
      'investigation': 'showInvestigation',
      'advice': 'showAdvice',
      'diagnosis': 'showDiagnosis',
      'disease': 'showDisease',
      'drugHistory': 'showDrugHistory'
    };

    const patch: any = {};
    let changed = false;

    Object.keys(sectionMap).forEach(key => {
      const content = this.prescriptionForm.get(key)?.value;
      const toggle = sectionMap[key];
      const isVisible = this.prescriptionForm.get(toggle)?.value;

      if (content && typeof content === 'string' && content.trim().length > 0 && !isVisible) {
        patch[toggle] = true;
        changed = true;
      }
    });

    if (changed) {
      this.prescriptionForm.patchValue(patch);
    }
  }

  onSave(action: 'save' | 'print' | 'printWithoutHeader'): void {
    if (action === 'printWithoutHeader') {
      this.hideHeaderOnPrint = true;
      this.onSubmit('print');
    } else if (action === 'print') {
      this.hideHeaderOnPrint = false;
      this.onSubmit('print');
    } else {
      this.hideHeaderOnPrint = false;
      this.onSubmit('save');
    }
  }

  onSubmit(action: 'save' | 'print' = 'save'): void {
    if (this.prescriptionForm.invalid || this.medicinesFormArray.length === 0) {
      this.markFormGroupTouched(this.prescriptionForm);
      if (this.medicinesFormArray.length === 0) {
        alert('Please add at least one medicine to the prescription.');
      }
      return;
    }

    this.submitting = true;

    // Save new templates
    Promise.all([
      this.saveNewDoses(),
      this.saveNewAdvice(),
      this.saveNewDuration()
    ]).then(() => {
      this.performSubmit(action);
    });
  }

  private async saveNewDoses(): Promise<void> {
    const currentDoses = this.doseTemplates();
    const formDoses = (this.prescriptionForm.value.medicines as any[]).map(m => m.dosage);
    const newDoses = [...new Set(formDoses.filter(d => d && !currentDoses.includes(d)))];

    if (newDoses.length === 0) return;

    const savePromises = newDoses.map(dose => {
      return new Promise<void>((resolve) => {
        this.drugDoseService.createDrugDoseTemplate({
          name: dose,
          isActive: true
        }).subscribe({
          next: () => {
            // Update local list
            this.doseTemplates.update(d => [...d, dose]);
            resolve();
          },
          error: () => resolve() // Resolve anyway to not block submission
        });
      });
    });

    await Promise.all(savePromises);
  }

  private async saveNewAdvice(): Promise<void> {
    const currentAdvices = this.adviceTemplates();
    const formAdvices = (this.prescriptionForm.value.medicines as any[]).map(m => m.instructions);
    const newAdvices = [...new Set(formAdvices.filter(a => a && !currentAdvices.includes(a)))];

    if (newAdvices.length === 0) return;

    const savePromises = newAdvices.map(advice => {
      return new Promise<void>((resolve) => {
        this.drugAdviceService.createDrugAdvice({
          name: advice,
          displayOrder: 0,
          isActive: true
        }).subscribe({
          next: () => {
            this.adviceTemplates.update(a => [...a, advice]);
            resolve();
          },
          error: () => resolve()
        });
      });
    });

    await Promise.all(savePromises);
  }

  private async saveNewDuration(): Promise<void> {
    const currentDurations = this.durationTemplates();
    const formDurations = (this.prescriptionForm.value.medicines as any[]).map(m => m.duration);
    const newDurations = [...new Set(formDurations.filter(d => d && !currentDurations.includes(d)))];

    if (newDurations.length === 0) return;

    const savePromises = newDurations.map(duration => {
      return new Promise<void>((resolve) => {
        this.drugDurationTemplateService.createDrugDurationTemplate({
          name: duration,
          isActive: true
        }).subscribe({
          next: () => {
            this.durationTemplates.update(d => [...d, duration]);
            resolve();
          },
          error: () => resolve()
        });
      });
    });

    await Promise.all(savePromises);
  }

  private performSubmit(action: 'save' | 'print'): void {
    const formValue = this.prescriptionForm.value;

    // Map medicines to DTO structure with PascalCase
    const medicines = formValue.medicines.map((med: any) => ({
      Id: null, // For new medicines
      EncryptedId: med.id || null,
      MedicineEncryptedId: med.medicineId ? String(med.medicineId) : null,
      Dosage: med.dosage || '',
      Frequency: med.frequency || '',
      Duration: med.duration || '',
      Instructions: med.instructions || null,
      Quantity: med.quantity || 0,
      IsActive: true
    }));

    // Build DTO matching PrescriptionDto structure (PascalCase)
    const prescriptionDto: any = {
      Id: 0, // Let backend handle ID
      EncryptedId: this.prescriptionId || null,
      DoctorEncryptedId: this.currentDoctorId ? String(this.currentDoctorId) : null,
      PatientEncryptedId: formValue.patientId ? String(formValue.patientId) : null,
      AppointmentEncryptedId: formValue.appointmentId ? String(formValue.appointmentId) : null,
      PrescriptionDate: new Date(formValue.prescriptionDate).toISOString(),

      // Patient header details
      PatientName: formValue.patientName || null,
      PatientAge: formValue.patientAge ? String(formValue.patientAge) : null,
      PatientGender: formValue.patientGender || null,
      PatientWeight: formValue.patientWeight || null,
      PatientPhone: formValue.patientPhone || null,
      PatientAddress: formValue.patientAddress || null,
      PatientRegNo: formValue.patientRegNo ? parseInt(formValue.patientRegNo) : null,

      // Clinical sections
      Disease: formValue.disease || null,
      ChiefComplaint: formValue.chiefComplaint || null,
      OnExamination: formValue.onExamination || null,
      Investigation: formValue.investigation || null,
      Advice: formValue.advice || null,
      Diagnosis: formValue.diagnosis || null,
      DrugHistory: formValue.drugHistory || null,
      Notes: formValue.notes || null,

      Status: 'Draft',
      IsActive: true,
      Medicines: medicines
    };

    const operation = this.isEditMode
      ? this.prescriptionService.updatePrescription(prescriptionDto)
      : this.prescriptionService.createPrescription(prescriptionDto);

    operation.subscribe({
      next: (savedPrescription) => {
        this.submitting = false;

        if (action === 'print') {
          // If created new, update state to Edit Mode so we don't create duplicates
          if (!this.isEditMode && savedPrescription.id) {
            this.isEditMode = true;
            this.prescriptionId = savedPrescription.id;
            // Quietly update URL without reloading
            window.history.replaceState({}, '', `/doctor/prescriptions/${savedPrescription.id}`);
          }
          // Print after a short delay to ensure DOM is ready
          setTimeout(() => {
            window.print();
            // Optionally reset hideHeader after print (user might want to see it back)
            // But print dialog is modal, so execution pauses or continues. 
            // We can rename hideHeaderOnPrint to hideHeader and toggle it.
          }, 500);
        } else {
          // Save Only -> Navigate to List or Detail
          this.router.navigate(['/doctor/prescriptions']);
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Prescription save error:', err);
        alert(`Failed to ${this.isEditMode ? 'update' : 'create'} prescription. Please try again.`);
      }
    });
  }

  // Helper method for clean template
  onPrint(): void {
    // Legacy method if used by template, redirect to Preview
    this.onPreview();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(group => {
          if (group instanceof FormGroup) {
            this.markFormGroupTouched(group);
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isFieldInvalid(fieldName: string, index?: number): boolean {
    if (index !== undefined) {
      const medicineForm = this.medicinesFormArray.at(index) as FormGroup;
      const field = medicineForm.get(fieldName);
      return !!(field && field.invalid && field.touched);
    }
    const field = this.prescriptionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getMedicineName(index: number): string {
    const medicineForm = this.medicinesFormArray.at(index) as FormGroup;
    const medicine = medicineForm.get('_medicine')?.value as Medicine;
    return medicine ? medicine.medicineName : 'Unknown Medicine';
  }
}
