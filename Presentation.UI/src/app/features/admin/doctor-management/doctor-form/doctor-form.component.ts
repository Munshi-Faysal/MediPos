import { Component, OnInit, inject } from '@angular/core';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Doctor, DoctorStatus } from '../../../../core/models/doctor.model';
import { DoctorService } from '../../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.scss']
})
export class DoctorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  doctorForm!: FormGroup;
  isEditMode = false;
  doctorId: string | null = null;
  loading = false;
  submitting = false;

  doctorStatuses = Object.values(DoctorStatus);

  // Common specializations
  specializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Rheumatology',
    'Surgery',
    'Urology',
    'Other'
  ];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.doctorId = params['id'];
        this.isEditMode = true;
        this.loadDoctor();
      }
    });
  }

  initializeForm(): void {
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(3)]],
      licenseExpiryDate: ['', [Validators.required]],
      billingDate: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      specialization: [''],
      address: [''],
      status: [DoctorStatus.ACTIVE, [Validators.required]]
    });

    // Custom validators
    this.doctorForm.get('licenseExpiryDate')?.valueChanges.subscribe(() => {
      this.validateLicenseExpiry();
    });

    this.doctorForm.get('billingDate')?.valueChanges.subscribe(() => {
      this.validateBillingDate();
    });
  }


  loadDoctor(): void {
    if (!this.doctorId) return;

    this.loading = true;
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.doctorForm.patchValue({
          name: doctor.name,
          licenseNumber: doctor.licenseNumber,
          licenseExpiryDate: this.formatDateForInput(doctor.licenseExpiryDate),
          billingDate: this.formatDateForInput(doctor.billingDate),
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization || '',
          address: doctor.address || '',
          status: doctor.status
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load doctor. Please try again.');
        this.router.navigate(['/admin/doctors']);
      }
    });
  }

  validateLicenseExpiry(): void {
    const expiryDate = this.doctorForm.get('licenseExpiryDate')?.value;
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const today = new Date();
      if (expiry < today) {
        this.doctorForm.get('licenseExpiryDate')?.setErrors({ pastDate: true });
      } else {
        this.doctorForm.get('licenseExpiryDate')?.setErrors(null);
      }
    }
  }

  validateBillingDate(): void {
    const billingDate = this.doctorForm.get('billingDate')?.value;
    if (billingDate) {
      const billing = new Date(billingDate);
      const today = new Date();
      if (billing < today) {
        this.doctorForm.get('billingDate')?.setErrors({ pastDate: true });
      } else {
        this.doctorForm.get('billingDate')?.setErrors(null);
      }
    }
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched(this.doctorForm);
      return;
    }

    this.submitting = true;
    const formValue = this.doctorForm.value;

    const doctor: Doctor = {
      id: this.doctorId || '',
      name: formValue.name,
      licenseNumber: formValue.licenseNumber,
      licenseExpiryDate: new Date(formValue.licenseExpiryDate),
      billingDate: new Date(formValue.billingDate),
      email: formValue.email,
      phone: formValue.phone,
      specialization: formValue.specialization || undefined,
      address: formValue.address || undefined,
      status: formValue.status,
      password: formValue.password || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const operation = this.isEditMode
      ? this.doctorService.updateDoctor(this.doctorId!, doctor)
      : this.doctorService.createDoctor(doctor);

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/doctors']);
      },
      error: () => {
        this.submitting = false;
        alert(`Failed to ${this.isEditMode ? 'update' : 'create'} doctor. Please try again.`);
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.doctorForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.doctorForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Invalid email address';
    }
    if (field?.hasError('pattern')) {
      return `Invalid ${this.getFieldLabel(fieldName)} format`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.hasError('pastDate')) {
      return `${this.getFieldLabel(fieldName)} cannot be in the past`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      licenseNumber: 'License Number',
      licenseExpiryDate: 'License Expiry Date',
      billingDate: 'Billing Date',
      email: 'Email',
      phone: 'Phone Number',
      specialization: 'Specialization',
      address: 'Address',
      status: 'Status',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }
}
