import { Component, OnInit, inject } from '@angular/core';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Medicine, MedicineForm } from '../../../../core/models/medicine.model';
import { MedicineService } from '../../../../core/services/medicine.service';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './medicine-form.component.html',
  styleUrls: ['./medicine-form.component.scss']
})
export class MedicineFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  medicineForm!: FormGroup;
  isEditMode = false;
  medicineId: string | null = null;
  loading = false;
  submitting = false;

  medicineForms = Object.values(MedicineForm);

  // Common categories
  categories = [
    'Analgesic',
    'Antibiotic',
    'Antiviral',
    'Antifungal',
    'Antihistamine',
    'Anti-inflammatory',
    'Antacid',
    'Antidepressant',
    'Antidiabetic',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Vitamins',
    'Other'
  ];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.medicineId = params['id'];
        this.isEditMode = true;
        this.loadMedicine();
      }
    });
  }

  initializeForm(): void {
    this.medicineForm = this.fb.group({
      genericName: ['', [Validators.required, Validators.minLength(2)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      medicineName: ['', [Validators.required, Validators.minLength(2)]],
      pack: ['', [Validators.required]],
      variation: ['', [Validators.required]],
      form: ['', [Validators.required]],
      price: [0, [Validators.min(0)]],
      stockQuantity: [0, [Validators.min(0)]],
      expiryDate: [''],
      batchNumber: [''],
      manufacturerDetails: [''],
      category: [''],
      isActive: [true]
    });
  }

  loadMedicine(): void {
    if (!this.medicineId) return;

    this.loading = true;
    this.medicineService.getMedicineById(this.medicineId).subscribe({
      next: (medicine) => {
        this.medicineForm.patchValue({
          genericName: medicine.genericName,
          companyName: medicine.companyName,
          medicineName: medicine.medicineName,
          pack: medicine.pack,
          variation: medicine.variation,
          form: medicine.form,
          price: medicine.price || 0,
          stockQuantity: medicine.stockQuantity || 0,
          expiryDate: medicine.expiryDate ? this.formatDateForInput(medicine.expiryDate) : '',
          batchNumber: medicine.batchNumber || '',
          manufacturerDetails: medicine.manufacturerDetails || '',
          category: medicine.category || '',
          isActive: medicine.isActive ?? true
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load medicine. Please try again.');
        this.router.navigate(['/admin/medicines']);
      }
    });
  }

  onSubmit(): void {
    if (this.medicineForm.invalid) {
      this.markFormGroupTouched(this.medicineForm);
      return;
    }

    this.submitting = true;
    const formValue = this.medicineForm.value;

    const medicine: Medicine = {
      id: this.medicineId || '',
      genericName: formValue.genericName,
      companyName: formValue.companyName,
      medicineName: formValue.medicineName,
      pack: formValue.pack,
      variation: formValue.variation,
      form: formValue.form,
      price: formValue.price || 0,
      stockQuantity: formValue.stockQuantity || 0,
      expiryDate: formValue.expiryDate ? new Date(formValue.expiryDate) : undefined,
      batchNumber: formValue.batchNumber || '',
      manufacturerDetails: formValue.manufacturerDetails || '',
      category: formValue.category || '',
      isActive: formValue.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const operation = this.isEditMode
      ? this.medicineService.updateMedicine(this.medicineId!, medicine)
      : this.medicineService.createMedicine(medicine);

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/medicines']);
      },
      error: () => {
        this.submitting = false;
        alert(`Failed to ${this.isEditMode ? 'update' : 'create'} medicine. Please try again.`);
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
    const field = this.medicineForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.medicineForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than or equal to ${field.errors?.['min'].min}`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      genericName: 'Generic Name',
      companyName: 'Company Name',
      medicineName: 'Medicine Name',
      pack: 'Pack',
      variation: 'Variation/Strength',
      form: 'Form',
      price: 'Price',
      stockQuantity: 'Stock Quantity',
      expiryDate: 'Expiry Date',
      batchNumber: 'Batch Number',
      manufacturerDetails: 'Manufacturer Details',
      category: 'Category'
    };
    return labels[fieldName] || fieldName;
  }
}
