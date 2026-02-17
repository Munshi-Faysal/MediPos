import { Component, OnInit, signal, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Prescription, PrescriptionStatus, PrescriptionFilters } from '../../../../core/models/prescription.model';
import { Doctor, DoctorStatus } from '../../../../core/models/doctor.model';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { PatientService } from '../../../../core/services/patient.service';
import { DynamicTableComponent, TableColumn, TableData } from '../../../../shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-prescription-list-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, DynamicTableComponent],
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.scss']
})
export class PrescriptionListAdminComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private doctorService = inject(DoctorService);
  private patientService = inject(PatientService);
  private router = inject(Router);

  prescriptions = signal<Prescription[]>([]);
  filteredPrescriptions = signal<Prescription[]>([]);
  assignedDoctors = signal<Doctor[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Filter states
  selectedDoctor = signal<string>('');
  selectedStatus = signal<PrescriptionStatus | ''>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  prescriptionStatuses = Object.values(PrescriptionStatus);

  // Table columns
  columns: TableColumn[] = [
    { key: 'sl', title: 'SL', sortable: false, width: '80px' },
    { key: 'prescriptionDate', title: 'Date', sortable: true },
    { key: 'doctorName', title: 'Doctor', sortable: true },
    { key: 'patientName', title: 'Patient', sortable: true },
    { key: 'diagnosis', title: 'Diagnosis', sortable: false },
    { key: 'medicinesCount', title: 'Medicines', sortable: false, width: '100px' },
    { key: 'status', title: 'Status', sortable: true, width: '120px' },
    { key: 'actions', title: 'Actions', sortable: false, width: '150px' }
  ];

  ngOnInit(): void {
    this.loadAssignedDoctors();
    this.loadPrescriptions();

    this.prescriptionService.prescriptions$.subscribe((prescriptions: any) => {
      this.prescriptions.set(prescriptions);
      this.applyFilters();
    });
  }

  loadAssignedDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        // Filter only active doctors (assigned doctors)
        const activeDoctors = doctors.filter(d => d.status === DoctorStatus.ACTIVE);
        this.assignedDoctors.set(activeDoctors);
      }
    });
  }

  loadPrescriptions(): void {
    this.loading.set(true);
    this.prescriptionService.getPrescriptions().subscribe({
      next: (prescriptions) => {
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

  onDoctorFilterChange(doctorId: string): void {
    this.selectedDoctor.set(doctorId);
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
      doctorId: this.selectedDoctor() || undefined,
      status: this.selectedStatus() || undefined,
      startDate: this.dateFrom() ? new Date(this.dateFrom()) : undefined,
      endDate: this.dateTo() ? new Date(this.dateTo()) : undefined
    };

    this.prescriptionService.filterPrescriptions(filters).subscribe({
      next: (filtered: any) => {
        this.filteredPrescriptions.set(filtered);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedDoctor.set('');
    this.selectedStatus.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.applyFilters();
  }

  getTableData(): TableData[] {
    return this.filteredPrescriptions().map((prescription, index) => {
      const doctor = this.assignedDoctors().find(d => d.id === prescription.doctorId);
      const doctorName = doctor ? doctor.name : 'Unknown Doctor';

      return {
        sl: index + 1,
        id: prescription.id,
        prescriptionDate: this.formatDate(prescription.prescriptionDate),
        doctorName: doctorName,
        patientName: 'Patient ' + prescription.patientId.substring(0, 8), // In real app, load patient name
        diagnosis: prescription.diagnosis || '-',
        medicinesCount: prescription.medicines.length,
        status: prescription.status,
        _prescription: prescription, // Store full object for actions
        _doctor: doctor
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
      this.router.navigate(['/admin/prescriptions', prescription.id]);
    }
  }

  onView(prescription: Prescription): void {
    this.router.navigate(['/admin/prescriptions', prescription.id]);
  }
}
