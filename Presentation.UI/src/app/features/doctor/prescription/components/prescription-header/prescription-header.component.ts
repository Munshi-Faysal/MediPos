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
      <div class="flex justify-between items-start border-b-2 border-gray-300" [style.background]="getGradient()" [ngClass]="{'print:hidden': isPrintHeaderHidden}">
    
        <!-- Left Section: Doctor Info -->
        <div class="flex p-6 pl-12 items-start">
          <div class="text-left space-y-1" [style.color]="config.textColor">
            @if (config.showDoctorName) {
              <h1 class="text-2xl font-bold">{{ config.doctorName }}</h1>
            }
            @if (config.showDegrees) {
              <p class="font-bold">{{ config.degrees }}</p>
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
          </div>
        </div>
    
        <!-- Right: Chamber Info -->
        <div class="p-6 text-right space-y-1" [style.color]="config.textColor">
          <p class="font-bold">Chamber:</p>
          @if (config.showChamberName) {
            <p class="text-sm font-semibold">{{ config.chamberName }}</p>
          }
          @if (config.showChamberAddress) {
            <p class="text-sm">{{ config.chamberAddress }}</p>
          }
          @if (config.showMobile) {
            <p class="text-sm">Mobile: {{ config.mobile }}</p>
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
      <div class="bg-white p-3 pl-12 border-b-2 border-gray-800 text-[12px] leading-relaxed">
        <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
          @for (field of sortedFields; track field.id) {
            <div [class]="getFieldClasses(field.id)">
              <span class="font-bold text-gray-900 whitespace-nowrap">{{ field.label }}</span>
              <span class="mx-1">:</span>
              <div class="flex-1 border-b border-gray-200 px-1 relative top-[1px] min-h-[1.2rem]">
                @if (isEditable(field.id)) {
                  <!-- Input/Select for Screen -->
                  @if (field.id === 'sex') {
                    <select [formControlName]="getControlName(field.id)" 
                            [class.appearance-none]="parentForm.get(getControlName(field.id))?.value"
                            class="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-800 text-sm font-medium placeholder-gray-300 print:hidden cursor-pointer"
                            (click)="$event.stopPropagation()">
                      <option value="" style="display:none"></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  } @else {
                    <input [formControlName]="getControlName(field.id)" 
                           class="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-800 font-medium placeholder-gray-300 print:hidden"
                           [placeholder]="field.label">
                  }
                  <!-- Text for Print -->
                  <span class="hidden print:block text-gray-800 font-bold">
                    {{ parentForm.get(getControlName(field.id))?.value || '' }}
                  </span>
                } @else {
                  <span class="text-gray-800 font-bold whitespace-nowrap">
                    {{ getFieldValue(field.id) }}
                  </span>
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
    input {
        line-height: inherit;
        font-size: inherit;
    }
    @media print {
      .header-container {
        border: none !important;
      }
      input {
        border: none !important;
        outline: none !important;
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

  getFieldClasses(id: string): string {
    const base = 'flex items-baseline ';
    switch (id) {
      case 'name': return base + 'flex-grow min-w-[30%]';
      case 'address': return base + 'flex-grow min-w-[40%]';
      case 'phone': return base + 'min-w-[180px]';
      case 'date': return base + 'min-w-[140px]';
      case 'age': return base + 'min-w-[80px]';
      case 'sex': return base + 'min-w-[100px]';
      case 'weight': return base + 'min-w-[80px]';
      case 'regNo': return base + 'min-w-[150px]';
      default: return base + 'flex-grow';
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
