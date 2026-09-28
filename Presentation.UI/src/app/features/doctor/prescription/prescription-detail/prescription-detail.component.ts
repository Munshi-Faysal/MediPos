import { Component, OnInit, ViewChild, inject } from '@angular/core';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PrescriptionStatus } from '../../../../core/models/prescription.model';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { confirmAppAction, showAppAlert } from '../../../../core/utils/app-alert';
import { PrescriptionBarcodeComponent } from '../components/prescription-barcode/prescription-barcode.component';

interface DetailMedicine {
  medicineName?: string;
  drugTypeName?: string;
  strengthName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
}

interface DetailPrescription {
  id?: number;
  encryptedId?: string;
  scanToken?: string;
  prescriptionDate?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  patientWeight?: string;
  patientAddress?: string;
  patientRegNo?: number;
  disease?: string;
  chiefComplaint?: string;
  onExamination?: string;
  investigation?: string;
  advice?: string;
  drugHistory?: string;
  diagnosis?: string;
  notes?: string;
  status?: string;
  medicines: DetailMedicine[];
}

@Component({
  selector: 'app-prescription-detail',
  standalone: true,
  imports: [RouterModule, PrescriptionBarcodeComponent],
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss']
})
export class PrescriptionDetailComponent implements OnInit {
  @ViewChild(PrescriptionBarcodeComponent) private barcode?: PrescriptionBarcodeComponent;
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  prescription: DetailPrescription | null = null;
  loading = true;
  deleting = false;
  editing = false;
  printing = false;
  loadError = '';
  prescriptionId = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.prescriptionId = params['id'];
        this.loadPrescription(this.prescriptionId);
      }
    });
  }

  loadPrescription(id: string): void {
    this.loading = true;
    this.loadError = '';
    this.prescriptionService.getPrescriptionById(id).subscribe({
      next: (prescription: DetailPrescription) => {
        this.prescription = {
          ...prescription,
          medicines: prescription.medicines || []
        };
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.loadError = this.getErrorMessage(error, 'Failed to load this prescription. Please try again.');
      }
    });
  }

  async onEdit(): Promise<void> {
    const id = this.actionId;
    if (!id || this.editing || this.deleting) return;

    this.editing = true;
    try {
      const navigated = await this.router.navigate(['/doctor/prescriptions', id, 'edit']);
      if (!navigated) {
        await showAppAlert('Unable to open the prescription editor. Please try again.', 'error');
      }
    } finally {
      this.editing = false;
    }
  }

  async onDelete(): Promise<void> {
    const id = this.actionId;
    if (!id || this.deleting || this.editing) return;

    const confirmed = await confirmAppAction({
      title: 'Delete prescription?',
      text: 'Are you sure you want to delete this prescription? This action cannot be undone.',
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      this.deleting = true;
      this.prescriptionService.deletePrescription(id).pipe(
        finalize(() => this.deleting = false)
      ).subscribe({
        next: async () => {
          await showAppAlert('Prescription deleted successfully.', 'success');
          await this.router.navigate(['/doctor/prescriptions']);
        },
        error: (error) => {
          void showAppAlert(
            this.getErrorMessage(error, 'Failed to delete the prescription. Please try again.'),
            'error'
          );
        }
      });
    }
  }

  async onPrint(): Promise<void> {
    if (!this.prescription || this.printing || this.deleting) return;

    this.printing = true;
    try {
      this.barcode?.renderBarcode();
      await document.fonts?.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      window.print();
    } finally {
      this.printing = false;
    }
  }

  get actionId(): string {
    return this.prescription?.encryptedId || this.prescriptionId;
  }

  get hasClinicalNotes(): boolean {
    const prescription = this.prescription;
    return !!(prescription && (
      prescription.disease ||
      prescription.chiefComplaint ||
      prescription.onExamination ||
      prescription.investigation ||
      prescription.advice ||
      prescription.drugHistory ||
      prescription.diagnosis ||
      prescription.notes
    ));
  }

  get shortCode(): string {
    return this.prescription?.scanToken?.slice(0, 10).toUpperCase()
      || String(this.prescription?.id || '').padStart(5, '0');
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'N/A';

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case PrescriptionStatus.COMPLETED.toLowerCase():
        return 'bg-green-100 text-green-800';
      case PrescriptionStatus.DRAFT.toLowerCase():
        return 'bg-yellow-100 text-yellow-800';
      case PrescriptionStatus.CANCELLED.toLowerCase():
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.exceptionMessage || fallback;
  }
}
