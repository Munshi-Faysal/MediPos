import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Doctor, DoctorStatus, DoctorFilters } from '../../../../core/models/doctor.model';
import { DoctorService } from '../../../../core/services/doctor.service';
import { DynamicTableComponent, TableColumn } from '../../../../shared/components/dynamic-table/dynamic-table.component';
import { TableData } from '../../../../shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss']
})
export class DoctorListComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private router = inject(Router);

  doctors = signal<Doctor[]>([]);
  filteredDoctors = signal<Doctor[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Filter states
  selectedStatus = signal<DoctorStatus | ''>('');
  selectedSpecialization = signal<string>('');


  // Available filters
  doctorStatuses = Object.values(DoctorStatus);
  specializations = signal<string[]>([]);

  // License expiry warnings
  expiringLicenses = signal<Doctor[]>([]);
  upcomingBilling = signal<Doctor[]>([]);

  // Dashboard Stats
  activeCount = computed(() => this.doctors().filter(d => d.status === DoctorStatus.ACTIVE).length);
  suspendedCount = computed(() => this.doctors().filter(d => d.status === DoctorStatus.SUSPENDED).length);
  pendingBillingCount = computed(() => this.upcomingBilling().length || 0);
  expiringLicenseCount = computed(() => this.expiringLicenses().length || 0);

  ngOnInit(): void {
    this.loadDoctors();
    this.loadExpiringLicenses();
    this.loadUpcomingBilling();

    this.doctorService.doctors$.subscribe(doctors => {
      this.doctors.set(doctors);
      this.updateFilters();
      this.applyFilters();
    });
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.updateFilters();
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadExpiringLicenses(): void {
    this.doctorService.getDoctorsWithExpiringLicenses(30).subscribe({
      next: (doctors) => {
        this.expiringLicenses.set(doctors);
      }
    });
  }

  loadUpcomingBilling(): void {
    this.doctorService.getDoctorsWithUpcomingBilling(7).subscribe({
      next: (doctors) => {
        this.upcomingBilling.set(doctors);
      }
    });
  }

  updateFilters(): void {
    const doctors = this.doctors();
    if (!doctors) {
      this.specializations.set([]);
      return;
    }
    const uniqueSpecializations = [...new Set(doctors.map(d => d?.specialization).filter(Boolean))] as string[];
    this.specializations.set(uniqueSpecializations);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onStatusFilterChange(status: DoctorStatus | ''): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  onSpecializationFilterChange(specialization: string): void {
    this.selectedSpecialization.set(specialization);
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: DoctorFilters = {
      search: this.searchQuery(),
      status: this.selectedStatus() || undefined,
      specialization: this.selectedSpecialization() || undefined
    };

    this.doctorService.filterDoctors(filters).subscribe({
      next: (filtered) => {
        this.filteredDoctors.set(filtered);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedSpecialization.set('');
    this.applyFilters();
  }

  getTableData(): TableData[] {
    return this.filteredDoctors().map((doctor, index) => {
      const licenseExpiry = new Date(doctor.licenseExpiryDate);
      const billingDate = new Date(doctor.billingDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilBilling = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Format license expiry with warning indicator
      let licenseExpiryDisplay = this.formatDate(doctor.licenseExpiryDate);
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        licenseExpiryDisplay += ` ⚠️ (${daysUntilExpiry}d)`;
      }

      // Format billing date with warning indicator
      let billingDateDisplay = this.formatDate(doctor.billingDate);
      if (daysUntilBilling <= 7 && daysUntilBilling >= 0) {
        billingDateDisplay += ` ⚠️ (${daysUntilBilling}d)`;
      }

      return {
        sl: index + 1,
        id: doctor.id,
        name: doctor.name,
        licenseNumber: doctor.licenseNumber,
        licenseExpiryDate: licenseExpiryDisplay,
        billingDate: billingDateDisplay,
        specialization: doctor.specialization || '-',
        email: doctor.email,
        phone: doctor.phone,
        status: doctor.status,
        _licenseExpiryWarning: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
        _billingWarning: daysUntilBilling <= 7 && daysUntilBilling >= 0,
        _doctor: doctor // Store full object for actions
      };
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isLicenseExpiring(doctor: Doctor): boolean {
    const expiry = new Date(doctor.licenseExpiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }

  isBillingUpcoming(doctor: Doctor): boolean {
    const billing = new Date(doctor.billingDate);
    const today = new Date();
    const daysUntilBilling = Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilBilling <= 7 && daysUntilBilling >= 0;
  }

  getStatusBadgeClass(status: DoctorStatus): string {
    switch (status) {
      case DoctorStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case DoctorStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case DoctorStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onRowClick(row: TableData): void {
    const doctor = row['_doctor'] as Doctor;
    if (doctor) {
      this.router.navigate(['/admin/doctors', doctor.id]);
    }
  }

  onEdit(doctor: Doctor): void {
    this.router.navigate(['/admin/doctors', doctor.id, 'edit']);
  }

  onDelete(doctor: Doctor): void {
    if (confirm(`Are you sure you want to delete ${doctor.name}?`)) {
      this.doctorService.deleteDoctor(doctor.id).subscribe({
        next: () => {
          this.loadDoctors();
          this.loadExpiringLicenses();
          this.loadUpcomingBilling();
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          alert('Failed to delete doctor. Please try again.');
        }
      });
    }
  }
}
