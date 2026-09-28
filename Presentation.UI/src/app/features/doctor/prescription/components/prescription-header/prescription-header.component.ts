import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Patient } from '../../../../../core/models/patient.model';
import { PrescriptionHeaderConfig, DEFAULT_HEADER_CONFIG, PatientFieldConfig } from '../../../../../core/models/prescription-settings.model';

@Component({
  selector: 'app-prescription-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="header-container font-sans" [formGroup]="parentForm">
      <!-- Top Section: Doctor & Clinic Info -->
      <div class="prescription-letterhead flex justify-between items-start border-b-2 border-gray-300"
           [style.background]="getGradient()"
           [class.print-letterhead-blank]="isPrintHeaderHidden">
    
        <!-- Left Section: Doctor Info -->
        <div class="flex p-6 pl-12 items-start">
          <div class="text-left space-y-1" [style.color]="config.textColor">
            @if (config.showDoctorName) {
              <h1 class="text-lg font-bold">{{ config.doctorName }}</h1>
            }
            @if (config.showDesignation && config.designation) {
              <p class="text-sm font-semibold italic">{{ config.designation }}</p>
            }
            @if (config.showDegrees) {
              <p class="font-bold">{{ config.degrees }}</p>
            }
            @if (config.showFellowship && config.fellowship) {
              <p class="font-semibold text-sm">{{ config.fellowship }}</p>
            }
            @if (config.showSpecialties) {
              @for (spec of config.specialties; track spec) {
                <p class="text-sm">{{ spec }}</p>
              }
            }
            @if (config.showDepartment && config.department) {
              <p class="text-sm">{{ config.department }}</p>
            }
            @if (config.showInstitute && config.institute) {
              <p class="text-sm">{{ config.institute }}</p>
            }
            @if (config.showRegNo) {
              <p class="text-sm font-semibold mt-2">BMDC Reg. No- {{ config.regNo }}</p>
            }
            @if (config.showEmail && config.email) {
              <p class="text-sm">Email: {{ config.email }}</p>
            }
          </div>
        </div>
    
        <!-- Right: Chamber Info -->
        <div class="p-6 pr-10 text-right space-y-1 flex flex-col items-end justify-center" [style.color]="config.textColor">
          @if (config.showChamberLogo && config.chamberLogo) {
            <img [src]="config.chamberLogo" class="max-h-14 max-w-[160px] object-contain mb-2" alt="Chamber Logo">
          }
          @if (config.showChamberName) {
            <p class="text-sm font-bold">{{ config.chamberName }}</p>
          }
          @if (config.showChamberAddress) {
            <p class="text-sm">{{ config.chamberAddress }}</p>
          }
          @if (config.showMobile) {
            <p class="text-sm">For Appointment: {{ config.mobile }}</p>
          }
          @if (config.showVisitTime) {
            <p class="text-sm">{{ config.visitTime }}</p>
          }
          @if (config.showOffDay) {
            <p class="text-sm font-bold">{{ config.offDay }}</p>
          }
        </div>
      </div>
    
      <!-- Dynamic Patient Info Bar -->
      <div class="patient-info-bar"
           [class.print-patient-info-blank]="isPrintHeaderHidden">
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
      .print-letterhead-blank,
      .print-patient-info-blank {
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
  @Input() parentForm!: FormGroup;
  @Input() patient: Patient | null = null;
  @Input() config: PrescriptionHeaderConfig = DEFAULT_HEADER_CONFIG;
  @Input() isPrintHeaderHidden = false;

  todayDate: Date = new Date();
  sortedFields: PatientFieldConfig[] = [];

  ngOnChanges() {
    this.updateSortedFields();
  }

  private updateSortedFields() {
    this.sortedFields = (this.config?.patientFields || [])
      .filter(f => f.visible)
      .sort((a, b) => a.order - b.order);
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

  getGradient() {
    if (this.config.leftSideBgColor === this.config.rightSideBgColor) {
      return this.config.leftSideBgColor;
    }
    return `linear-gradient(to right, ${this.config.leftSideBgColor} 50%, ${this.config.rightSideBgColor} 50%)`;
  }
}
