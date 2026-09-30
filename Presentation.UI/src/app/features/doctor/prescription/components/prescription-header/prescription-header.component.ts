import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Patient } from '../../../../../core/models/patient.model';
import { PrescriptionHeaderConfig, DEFAULT_HEADER_CONFIG, PatientFieldConfig } from '../../../../../core/models/prescription-settings.model';

@Component({
  selector: 'app-prescription-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="header-container font-sans" [formGroup]="parentForm">
      <!-- Top Section: Doctor & Clinic Info -->
      <div class="prescription-letterhead border-b-2 border-gray-300"
           [style.background]="getGradient()"
           [class.print-letterhead-blank]="isPrintHeaderHidden">

        <div class="letterhead-main">
          <!-- Left Section: English Doctor Info -->
          <div class="letterhead-primary">
            <div class="doctor-details english-doctor-details" [style.color]="config.textColor">
              @if (config.englishDoctor.name) {
                <h1 class="doctor-name">{{ config.englishDoctor.name }}</h1>
              }
              @if (config.englishDoctor.degrees) {
                <p class="doctor-degrees">{{ config.englishDoctor.degrees }}</p>
              }
              @if (config.englishDoctor.higherTraining) {
                <p class="doctor-training">{{ config.englishDoctor.higherTraining }}</p>
              }
              @if (config.englishDoctor.designation) {
                <p class="doctor-designation">{{ config.englishDoctor.designation }}</p>
              }
              @if (config.englishDoctor.specialty) {
                <p class="doctor-detail">{{ config.englishDoctor.specialty }}</p>
              }
              @if (config.englishDoctor.department) {
                <p class="doctor-detail">{{ config.englishDoctor.department }}</p>
              }
              @if (config.englishDoctor.institute) {
                <p class="doctor-detail">{{ config.englishDoctor.institute }}</p>
              }
              @if (config.englishDoctor.regNo) {
                <p class="doctor-contact">BMDC Reg. No- {{ config.englishDoctor.regNo }}</p>
              }
              @if (config.englishDoctor.phone) {
                <p class="doctor-contact">☎ {{ config.englishDoctor.phone }}</p>
              }
              @if (englishAdditionalInfoLines.length) {
                <div class="doctor-additional-info">
                  @for (line of englishAdditionalInfoLines; track $index) {
                    <p class="doctor-additional-line">{{ line }}</p>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Logo remains in the middle. -->
          <div class="letterhead-logo">
            @if (config.showChamberLogo && config.chamberLogo) {
              <img [src]="config.chamberLogo" alt="Chamber Logo">
            }
          </div>

          <!-- Right Section: Bangla Doctor Info -->
          <div class="letterhead-secondary" [style.color]="config.textColor">
            <div class="doctor-details bangla-doctor-details">
              @if (config.banglaDoctor.name) {
                <h1 class="doctor-name">{{ config.banglaDoctor.name }}</h1>
              }
              @if (config.banglaDoctor.degrees) {
                <p class="doctor-degrees">{{ config.banglaDoctor.degrees }}</p>
              }
              @if (config.banglaDoctor.higherTraining) {
                <p class="doctor-training">{{ config.banglaDoctor.higherTraining }}</p>
              }
              @if (config.banglaDoctor.designation) {
                <p class="doctor-designation">{{ config.banglaDoctor.designation }}</p>
              }
              @if (config.banglaDoctor.specialty) {
                <p class="doctor-detail">{{ config.banglaDoctor.specialty }}</p>
              }
              @if (config.banglaDoctor.department) {
                <p class="doctor-detail">{{ config.banglaDoctor.department }}</p>
              }
              @if (config.banglaDoctor.institute) {
                <p class="doctor-detail">{{ config.banglaDoctor.institute }}</p>
              }
              @if (config.banglaDoctor.regNo) {
                <p class="doctor-contact">বিএমডিসি রেজিঃ {{ config.banglaDoctor.regNo }}</p>
              }
              @if (config.banglaDoctor.phone) {
                <p class="doctor-contact">☎ {{ config.banglaDoctor.phone }}</p>
              }
              @if (banglaAdditionalInfoLines.length) {
                <div class="doctor-additional-info">
                  @for (line of banglaAdditionalInfoLines; track $index) {
                    <p class="doctor-additional-line">{{ line }}</p>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Chamber details stay below the bilingual doctor header. -->
        @if (hasVisibleChamberInfo()) {
          <div class="chamber-info-strip" [style.color]="config.textColor">
            @if (config.showChamberName && config.chamberName) {
              <span class="font-bold">{{ config.chamberName }}</span>
            }
            @if (config.showChamberAddress && config.chamberAddress) {
              <span>{{ config.chamberAddress }}</span>
            }
            @if (config.showMobile && config.mobile) {
              <span>For Appointment: {{ config.mobile }}</span>
            }
            @if (config.showVisitTime && config.visitTime) {
              <span>{{ config.visitTime }}</span>
            }
            @if (config.showOffDay && config.offDay) {
              <span class="font-bold">{{ config.offDay }}</span>
            }
          </div>
        }
      </div>
    
      <!-- Dynamic Patient Info Bar -->
      <div class="patient-info-bar">
        <div class="patient-info-grid">
          @for (field of sortedFields; track field.id) {
            <div class="patient-field" [class.patient-field-date]="field.id === 'date'">
              <span class="patient-field-label">{{ field.label }}</span>
              <div class="patient-field-value">
                @if (isEditable(field.id)) {
                  @if (field.id === 'sex') {
                    <select [formControlName]="getControlName(field.id)" [attr.aria-label]="field.label"
                            class="patient-field-control print:hidden"
                            (click)="$event.stopPropagation()">
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  } @else {
                    <input [formControlName]="getControlName(field.id)" [attr.aria-label]="field.label"
                           class="patient-field-control print:hidden" [placeholder]="field.label">
                  }
                  <span class="patient-field-print">{{ parentForm.get(getControlName(field.id))?.value || '' }}</span>
                } @else {
                  <span class="patient-field-static">{{ getFieldValue(field.id) }}</span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
    `,
  styles: [`
    :host { display: block; }
    .header-container {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        width: 100%;
    }
    .letterhead-main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: start;
      width: 100%;
    }
    .letterhead-primary,
    .letterhead-secondary {
      min-width: 0;
      padding-top: 28px;
      padding-bottom: 26px;
    }
    .letterhead-primary {
      padding-left: 42px;
      padding-right: 18px;
    }
    .letterhead-secondary {
      padding-left: 18px;
      padding-right: 42px;
      text-align: right;
    }
    .doctor-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
      text-align: left;
      overflow-wrap: break-word;
    }
    .english-doctor-details {
      font-family: Arial, Helvetica, sans-serif;
    }
    .english-doctor-details .doctor-name,
    .english-doctor-details .doctor-degrees,
    .english-doctor-details .doctor-designation,
    .english-doctor-details .doctor-contact {
      font-weight: 700;
    }
    .english-doctor-details .doctor-training,
    .english-doctor-details .doctor-detail,
    .english-doctor-details .doctor-additional-line {
      font-weight: 400;
    }
    .bangla-doctor-details {
      font-family: 'SutonnyMJ', 'SutonnyOMJ', 'Kalpurush', 'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', sans-serif;
      text-align: right;
    }
    .doctor-details h1,
    .doctor-details p {
      margin: 0;
    }
    .doctor-name {
      font-size: 18px;
      font-weight: 750;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }
    .bangla-doctor-details .doctor-name {
      font-size: 19px;
      letter-spacing: 0;
      line-height: 1.4;
    }
    .doctor-degrees {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
    }
    .doctor-training {
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.45;
    }
    .doctor-designation {
      margin-top: 2px !important;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;
    }
    .doctor-detail,
    .doctor-contact,
    .doctor-additional-line {
      font-size: 12.5px;
      line-height: 1.45;
    }
    .doctor-detail {
      font-weight: 500;
    }
    .doctor-contact {
      margin-top: 2px !important;
      font-weight: 700;
    }
    .letterhead-logo {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 28px 10px 0;
    }
    .letterhead-logo:empty {
      width: 0;
      padding: 0;
    }
    .letterhead-logo img {
      max-width: 96px;
      max-height: 60px;
      object-fit: contain;
    }
    .chamber-info-strip {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 4px 14px;
      padding: 7px 42px 9px;
      border-top: 1px solid rgba(148, 163, 184, 0.45);
      background: rgba(255, 255, 255, 0.32);
      font-size: 0.75rem;
      line-height: 1.25rem;
    }
    .doctor-additional-info {
      margin-top: 6px;
    }
    .doctor-additional-line {
      margin: 0;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }
    .patient-info-bar {
      padding: 12px 24px 14px;
      background: #ffffff;
      border-bottom: 2px solid #233657;
    }
    .patient-info-grid {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
      gap: 8px 10px;
    }
    .patient-field {
      min-width: 0;
      min-height: 43px;
      padding: 5px 9px 4px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: border-color .15s ease, background-color .15s ease;
    }
    .patient-field:focus-within {
      background: #ffffff;
      border-color: #2563eb;
    }
    .patient-field-date {
      background: #eef4ff;
      border-color: #dbe7fb;
    }
    .patient-field-label {
      display: block;
      color: #64748b;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .08em;
      line-height: 12px;
      text-transform: uppercase;
    }
    .patient-field-value {
      display: flex;
      align-items: center;
      min-width: 0;
      min-height: 19px;
      color: #0f172a;
      font-size: 12px;
      font-weight: 600;
      line-height: 19px;
    }
    .patient-field-control {
      width: 100%;
      min-width: 0;
      height: 19px;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: transparent;
      border: 0;
      outline: 0;
      box-shadow: none;
      font: inherit;
      line-height: 19px;
    }
    .patient-field-control:focus {
      outline: 0;
      box-shadow: none;
    }
    .patient-field-control::placeholder {
      color: #a6b2c3;
      font-weight: 400;
    }
    .patient-field-static,
    .patient-field-print {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .patient-field-print {
      display: none;
    }
    @media print {
      .print-letterhead-blank {
        visibility: hidden !important;
      }
      .header-container {
        border: none !important;
      }
      .patient-info-bar {
        padding: 8px 24px 10px;
        background: #ffffff !important;
      }
      .patient-info-grid {
        gap: 4px 16px;
      }
      .patient-field,
      .patient-field-date {
        min-height: 33px;
        padding: 2px 0;
        background: #ffffff !important;
        border: 0;
        border-bottom: 1px solid #cbd5e1;
        border-radius: 0;
      }
      .patient-field-print {
        display: block;
      }
      .patient-field-print,
      .patient-field-static {
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        overflow-wrap: anywhere;
      }
    }
  `]
})
export class PrescriptionHeaderComponent implements OnChanges {
  @Input() parentForm: FormGroup = new FormGroup({
    patientName: new FormControl(''),
    patientAge: new FormControl(''),
    patientGender: new FormControl(''),
    patientWeight: new FormControl(''),
    patientPhone: new FormControl(''),
    patientRegNo: new FormControl(''),
    patientAddress: new FormControl('')
  });
  @Input() patient: Patient | null = null;
  @Input() config: PrescriptionHeaderConfig = DEFAULT_HEADER_CONFIG;
  @Input() isPrintHeaderHidden = false;

  todayDate: Date = new Date();
  sortedFields: PatientFieldConfig[] = [];
  banglaAdditionalInfoLines: string[] = [];
  englishAdditionalInfoLines: string[] = [];

  ngOnChanges() {
    this.updateSortedFields();
    this.banglaAdditionalInfoLines = this.splitInfoLines(this.config?.banglaDoctor?.additionalInfo);
    this.englishAdditionalInfoLines = this.splitInfoLines(this.config?.englishDoctor?.additionalInfo);
  }

  private updateSortedFields() {
    this.sortedFields = (this.config?.patientFields || [])
      .filter(f => f.visible)
      .sort((a, b) => a.order - b.order);
  }

  private splitInfoLines(value: string | undefined): string[] {
    return (value || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  isEditable(id: string): boolean {
    return id !== 'date'; // Date is usually auto-filled
  }

  getControlName(id: string): string {
    switch (id) {
      case 'name': return 'patientName';
      case 'age': return 'patientAge';
      case 'sex': return 'patientGender';
      case 'weight': return 'patientWeight';
      case 'phone': return 'patientPhone';
      case 'regNo': return 'patientRegNo';
      case 'address': return 'patientAddress';
      default: return '';
    }
  }

  getFieldValue(id: string): string {
    if (id === 'date') return this.todayDate.toLocaleDateString('en-GB');
    return '';
  }

  hasVisibleChamberInfo(): boolean {
    return Boolean(
      (this.config.showChamberName && this.config.chamberName?.trim()) ||
      (this.config.showChamberAddress && this.config.chamberAddress?.trim()) ||
      (this.config.showMobile && this.config.mobile?.trim()) ||
      (this.config.showVisitTime && this.config.visitTime?.trim()) ||
      (this.config.showOffDay && this.config.offDay?.trim())
    );
  }

  getGradient() {
    if (this.config.leftSideBgColor === this.config.rightSideBgColor) {
      return this.config.leftSideBgColor;
    }
    return `linear-gradient(to right, ${this.config.leftSideBgColor} 50%, ${this.config.rightSideBgColor} 50%)`;
  }
}
