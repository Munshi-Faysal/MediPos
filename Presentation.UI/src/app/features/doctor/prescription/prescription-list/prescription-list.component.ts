import { Component, OnInit, signal, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Prescription, PrescriptionStatus, PrescriptionFilters } from '../../../../core/models/prescription.model';
import { User } from '../../../../core/models';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DynamicTableComponent, TableColumn, TableData } from '../../../../shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [RouterModule, FormsModule, DynamicTableComponent],
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.scss']
})
export class PrescriptionListComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);
  private authService = inject(AuthService);

  prescriptions = signal<Prescription[]>([]);
  filteredPrescriptions = signal<Prescription[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Filter states
  selectedStatus = signal<PrescriptionStatus | ''>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  prescriptionStatuses = Object.values(PrescriptionStatus);

  // Table columns
  columns: TableColumn[] = [
    { key: 'sl', title: 'SL', sortable: false, width: '80px' },
    { key: 'prescriptionDate', title: 'Date', sortable: true },
    { key: 'patientName', title: 'Patient', sortable: true },
    { key: 'diagnosis', title: 'Diagnosis', sortable: false },
    { key: 'medicinesCount', title: 'Medicines', sortable: false, width: '100px' },
    { key: 'status', title: 'Status', sortable: true, width: '120px' },
    { key: 'actions', title: 'Actions', sortable: false, width: '150px' }
  ];

  ngOnInit(): void {
    this.loadPrescriptions();

    this.prescriptionService.prescriptions$.subscribe((prescriptions: any) => {
      // API already filters by current doctor
      this.prescriptions.set(prescriptions);
      this.applyFilters();
    });
  }

  loadPrescriptions(): void {
    this.loading.set(true);
    this.prescriptionService.getPrescriptions().subscribe({
      next: (prescriptions) => {
        // API already filters by current doctor, so we use the raw list
        this.prescriptions.set(prescriptions);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onStatusFilterChange(status: PrescriptionStatus | ''): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  onDateFromChange(date: string): void {
    this.dateFrom.set(date);
    this.applyFilters();
  }

  onDateToChange(date: string): void {
    this.dateTo.set(date);
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: PrescriptionFilters = {
      search: this.searchQuery(),
      status: this.selectedStatus() || undefined,
      startDate: this.dateFrom() ? new Date(this.dateFrom()) : undefined,
      endDate: this.dateTo() ? new Date(this.dateTo()) : undefined
    };

    this.prescriptionService.filterPrescriptions(filters).subscribe({
      next: (filtered: any) => {
        // API handles filtering
        this.filteredPrescriptions.set(filtered);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.applyFilters();
  }

  getTableData(): TableData[] {
    return this.filteredPrescriptions().map((prescription, index) => {
      return {
        sl: index + 1,
        id: (prescription as any).encryptedId || prescription.id,
        prescriptionDate: this.formatDate(prescription.prescriptionDate),
        patientName: prescription.patientName || '-',
        diagnosis: prescription.diagnosis || '-',
        medicinesCount: prescription.medicinesCount || 0,
        status: prescription.status,
        _prescription: prescription // Store full object for actions
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

  getStatusBadgeClass(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PrescriptionStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case PrescriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onRowClick(row: TableData): void {
    const prescription = row['_prescription'] as Prescription;
    if (prescription) {
      const id = (prescription as any).encryptedId || prescription.id;
      this.router.navigate(['/doctor/prescriptions', id]);
    }
  }

  onView(prescription: Prescription): void {
    console.log('onView clicked', prescription);
    const id = (prescription as any).encryptedId || prescription.id;
    console.log('Navigating to View ID:', id);
    if (!id) alert('Error: Prescription ID is missing');
    this.router.navigate(['/doctor/prescriptions', id]);
  }

  onEdit(prescription: Prescription): void {
    console.log('onEdit clicked', prescription);
    const id = (prescription as any).encryptedId || prescription.id;
    console.log('Navigating to Edit ID:', id);
    if (!id) alert('Error: Prescription ID is missing');
    this.router.navigate(['/doctor/prescriptions', id, 'edit']);
  }

  onDelete(prescription: Prescription): void {
    const id = (prescription as any).encryptedId || prescription.id;
    if (confirm(`Are you sure you want to delete this prescription?`)) {
      this.prescriptionService.deletePrescription(id).subscribe({
        next: () => {
          this.loadPrescriptions();
        },
        error: (error) => {
          console.error('Error deleting prescription:', error);
          alert('Failed to delete prescription. Please try again.');
        }
      });
    }
  }
}
