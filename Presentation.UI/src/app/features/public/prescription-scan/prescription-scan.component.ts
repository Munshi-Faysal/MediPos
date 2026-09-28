import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { prescriptionBarcodeCode } from '../../../core/utils/prescription-barcode';

interface ScannedMedicine {
  medicineName?: string;
  drugTypeName?: string;
  strengthName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface ScannedPrescription {
  scanToken: string;
  prescriptionDate: string;
  status?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorSpecialization?: string;
  doctorLicenseNumber?: string;
  clinicName?: string;
  chamberAddress?: string;
  chamberContact?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  patientWeight?: string;
  patientRegNo?: number;
  disease?: string;
  chiefComplaint?: string;
  onExamination?: string;
  investigation?: string;
  advice?: string;
  drugHistory?: string;
  diagnosis?: string;
  notes?: string;
  medicines: ScannedMedicine[];
}

interface ClinicalSection {
  label: string;
  title: string;
  value: string;
}

@Component({
  selector: 'app-prescription-scan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-scan.component.html',
  styleUrls: ['./prescription-scan.component.scss']
})
export class PrescriptionScanComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private prescriptionService = inject(PrescriptionService);

  prescription: ScannedPrescription | null = null;
  clinicalSections: ClinicalSection[] = [];
  loading = true;
  notFound = false;

  ngOnInit(): void {
    const barcodeCode = this.route.snapshot.paramMap.get('code')?.trim() || '';
    const token = this.route.snapshot.paramMap.get('token')?.trim() || '';
    if ((barcodeCode && !/^\d{16}$/.test(barcodeCode)) ||
        (!barcodeCode && !/^[a-fA-F0-9]{32}$/.test(token))) {
      this.loading = false;
      this.notFound = true;
      return;
    }

    const request = barcodeCode
      ? this.prescriptionService.getPrescriptionByBarcodeCode(barcodeCode)
      : this.prescriptionService.getPrescriptionByScanToken(token);
    request.subscribe({
      next: (prescription: ScannedPrescription) => {
        this.prescription = prescription;
        this.clinicalSections = this.buildClinicalSections(prescription);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  get shortCode(): string {
    return this.prescription ? prescriptionBarcodeCode(this.prescription.scanToken) : '';
  }

  private buildClinicalSections(prescription: ScannedPrescription): ClinicalSection[] {
    return [
      { label: 'Dx', title: 'Disease', value: prescription.disease || '' },
      { label: 'C/C', title: 'Chief complaint', value: prescription.chiefComplaint || '' },
      { label: 'O/E', title: 'On examination', value: prescription.onExamination || '' },
      { label: 'I/X', title: 'Investigation', value: prescription.investigation || '' },
      { label: 'Advice', title: 'Advice', value: prescription.advice || '' },
      { label: 'D/H', title: 'Drug history', value: prescription.drugHistory || '' },
      { label: 'Δ', title: 'Diagnosis', value: prescription.diagnosis || '' },
      { label: 'Notes', title: 'Additional notes', value: prescription.notes || '' }
    ].filter(section => section.value.trim().length > 0);
  }
}
