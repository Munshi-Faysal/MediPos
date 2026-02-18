import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Package {
  id: number;
  name: string;
  price: number;
  duration: string;
  featureList: string[];
  description: string;
  isPopular?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  mobileMenuOpen = false;
  selectedPackage: Package | null = null;
  showPaymentForm = false;
  showWelcomeMessage = false;
  isProcessingPayment = false;
  isSubmitting = false;
  paymentForm!: FormGroup;
  paymentCompleted = false;

  packages: Package[] = [];

  ngOnInit(): void {
    this.initializePaymentForm();
    this.loadPackages();
  }

  loadPackages(): void {
    this.apiService.get<Package[]>('/Package/AvailablePackages').subscribe({
      next: (data: Package[]) => {
        this.packages = data || [];
      },
      error: (err: unknown) => {
        console.error('Failed to load packages', err);
      }
    });
  }

  initializePaymentForm(): void {
    this.paymentForm = this.fb.group({
      // Payment fields - optional
      cardNumber: ['', [this.cardNumberValidator]],
      cardHolder: ['', [Validators.minLength(3)]],
      expiryDate: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.pattern(/^\d{3,4}$/)]],
      // Organization details - required
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      // Password fields - required
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null; // Optional field
    }
    const value = control.value.replace(/\s/g, '');
    if (value.length === 16 && /^\d+$/.test(value)) {
      return null;
    }
    return { invalidCardNumber: true };
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleFeatures(pkg: Package, event: Event): void {
    event.stopPropagation();
    pkg.isExpanded = !pkg.isExpanded;
  }

  selectPackage(pkg: Package): void {
    this.selectedPackage = pkg;
    this.showPaymentForm = true;
    this.showWelcomeMessage = false;
    // Scroll to payment form
    setTimeout(() => {
      const paymentSection = document.getElementById('payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  changePackage(): void {
    this.selectedPackage = null;
    this.showPaymentForm = false;
    this.showWelcomeMessage = false;
    this.paymentCompleted = false;
    this.paymentForm.reset();
  }

  hasPaymentInfo(): boolean {
    const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
    const cardHolder = this.paymentForm.get('cardHolder')?.value || '';
    const expiryDate = this.paymentForm.get('expiryDate')?.value || '';
    const cvv = this.paymentForm.get('cvv')?.value || '';

    return !!(cardNumber.trim() || cardHolder.trim() || expiryDate.trim() || cvv.trim());
  }

  onSubmitPayment(): void {
    if (this.hasPaymentInfo() && !this.isPaymentInfoValid()) {
      // Mark payment fields as touched to show validation errors
      ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'].forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.paymentForm.valid && this.selectedPackage) {
      if (this.hasPaymentInfo()) {
        this.processPayment();
      } else {
        this.submitWithoutPayment();
      }
    } else {
      // Mark required fields as touched to show validation errors
      ['email', 'phone', 'organizationName', 'password', 'confirmPassword'].forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
    }
  }

  isPaymentInfoValid(): boolean {
    if (!this.hasPaymentInfo()) {
      return true; // No payment info is valid (optional)
    }

    const cardNumber = this.paymentForm.get('cardNumber');
    const cardHolder = this.paymentForm.get('cardHolder');
    const expiryDate = this.paymentForm.get('expiryDate');
    const cvv = this.paymentForm.get('cvv');

    // If any payment field is filled, all must be valid
    const hasCardNumber = cardNumber?.value?.trim();
    const hasCardHolder = cardHolder?.value?.trim();
    const hasExpiryDate = expiryDate?.value?.trim();
    const hasCvv = cvv?.value?.trim();

    if (hasCardNumber || hasCardHolder || hasExpiryDate || hasCvv) {
      return !cardNumber?.invalid && !cardHolder?.invalid && !expiryDate?.invalid && !cvv?.invalid;
    }

    return true;
  }

  processPayment(): void {
    this.isProcessingPayment = true;
    this.paymentCompleted = false;

    // Simulate payment processing
    setTimeout(() => {
      this.isProcessingPayment = false;
      this.paymentCompleted = true;
      this.submitForm();
    }, 2000);
  }

  submitWithoutPayment(): void {
    this.isSubmitting = true;
    this.paymentCompleted = false;

    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitForm();
    }, 1000);
  }

  submitForm(): void {
    if (!this.selectedPackage) {
      return;
    }

    // Check password match
    if (this.paymentForm.hasError('passwordMismatch')) {
      this.paymentForm.get('confirmPassword')?.markAsTouched();
      return;
    }

    // Prepare registration data
    const emailValue = this.paymentForm.get('email')?.value || '';
    const registrationData = {
      username: emailValue.split('@')[0] || `user_${Date.now()}`,
      displayName: this.paymentForm.get('organizationName')?.value || '',
      email: emailValue,
      password: this.paymentForm.get('password')?.value || '',
      organizationName: this.paymentForm.get('organizationName')?.value || '',
      phone: this.paymentForm.get('phone')?.value || '',
      packageId: this.selectedPackage.id,
      packageName: this.selectedPackage.name,
      packagePrice: this.selectedPackage.price,
      packageFeatures: JSON.stringify(this.selectedPackage.featureList),
      cardNumber: this.paymentForm.get('cardNumber')?.value?.replace(/\s/g, '') || null,
      cardHolder: this.paymentForm.get('cardHolder')?.value || null,
      expiryDate: this.paymentForm.get('expiryDate')?.value || null,
      cvv: this.paymentForm.get('cvv')?.value || null
    };

    // Call the backend API
    this.apiService.post('/Account/RegisterWithPackage', registrationData).subscribe({
      next: (response) => {
        this.showPaymentForm = false;
        this.showWelcomeMessage = true;

        // Scroll to welcome message
        setTimeout(() => {
          const welcomeSection = document.getElementById('welcome-section');
          if (welcomeSection) {
            welcomeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (error) => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message ||
          (error.error?.errors && Array.isArray(error.error.errors)
            ? error.error.errors.map((e: any) => e.description || e).join(', ')
            : error.message || 'Registration failed. Please try again.');
        alert(errorMessage);
        this.isProcessingPayment = false;
        this.isSubmitting = false;
      }
    });
  }

  skipPayment(): void {
    this.submitWithoutPayment();
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    // Add spaces every 4 digits
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentForm.patchValue({ cardNumber: value }, { emitEvent: true });
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentForm.patchValue({ expiryDate: value }, { emitEvent: false });
  }

  getErrorMessage(controlName: string): string {
    const control = this.paymentForm.get(controlName);
    const isPaymentField = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'].includes(controlName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'password') {
        return 'Password must contain uppercase, lowercase, number, and special character';
      }
      return `Invalid ${this.getFieldLabel(controlName)} format`;
    }
    if (control?.hasError('invalidCardNumber')) {
      return 'Card number must be 16 digits';
    }
    if (control?.hasError('email')) {
      return 'Invalid email address';
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(controlName)} is too short`;
    }
    if (controlName === 'confirmPassword' && this.paymentForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  isPaymentFieldInvalid(controlName: string): boolean {
    const control = this.paymentForm.get(controlName);
    // Only show error if field has value and is invalid
    if (control?.value && control.value.trim() !== '') {
      return !!(control && control.invalid && control.touched);
    }
    return false;
  }

  getFieldLabel(controlName: string): string {
    const labels: Record<string, string> = {
      cardNumber: 'Card Number',
      cardHolder: 'Card Holder Name',
      expiryDate: 'Expiry Date',
      cvv: 'CVV',
      email: 'Email',
      phone: 'Phone Number',
      organizationName: 'Organization Name',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.paymentForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}

