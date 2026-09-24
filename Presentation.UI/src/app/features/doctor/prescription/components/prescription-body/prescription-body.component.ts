import { Component, Input, Output, EventEmitter, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { PrescriptionBodyConfig, DEFAULT_BODY_CONFIG, BodySectionConfig } from '../../../../../core/models/prescription-settings.model';
import { Patient } from '../../../../../core/models/patient.model';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-prescription-body',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col md:flex-row min-h-[800px]" [formGroup]="parentForm">
    
      <!-- Left Column: Dynamic Sections -->
      @if (config.showLeftColumn) {
        <div class="clinical-column w-full md:w-1/3 border-r border-slate-200 px-4 pb-4 pt-4 print:w-1/3 print:border-gray-800 print:pt-2 relative">
          <!-- Barcode at TOP of left column -->
          @if (config.showBarcode && patient?.id) {
            <div class="mb-6 flex flex-col items-center">
              <div class="barcode-container bg-white p-1 pb-0 rounded">
                <svg #barcodeCanvas></svg>
              </div>
              <p class="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-tight">Reg: {{ patient?.id }}</p>
            </div>
          }
          <div class="mb-3 flex items-center justify-between print:hidden">
            <div>
              <p class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-700">Clinical notes</p>
              <p class="mt-0.5 text-[10px] text-slate-400">Enable a section to add details</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-slate-500">
              {{ sortedSections.length }} sections
            </span>
          </div>

          <div class="space-y-2 print:space-y-4">
            @for (section of sortedSections; track section.id) {
              <!-- Interactive card for screen -->
              <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 transition-all duration-200 print:hidden"
                   [class.border-blue-200]="isSectionVisible(section.id)"
                   [class.bg-white]="isSectionVisible(section.id)"
                   [class.shadow-sm]="isSectionVisible(section.id)">
                <div class="flex min-h-7 items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <span class="h-6 w-1 shrink-0 rounded-full bg-slate-300 transition-colors"
                          [class.bg-blue-500]="isSectionVisible(section.id)"></span>
                    <h3 class="truncate text-sm font-bold text-slate-700 transition-colors"
                        [class.text-blue-700]="isSectionVisible(section.id)">
                      {{ section.label }}
                    </h3>
                  </div>

                  <label class="relative inline-flex shrink-0 cursor-pointer items-center"
                         [attr.title]="'Show ' + section.label + ' section'">
                    <input type="checkbox"
                           [formControlName]="getToggleControlName(section.id)"
                           [attr.aria-label]="'Toggle ' + section.label + ' section'"
                           class="peer sr-only">
                    <span class="relative h-[22px] w-10 rounded-full bg-slate-200 shadow-inner transition-colors duration-200 peer-checked:bg-blue-600 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2
                                 after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:border after:border-slate-200 after:bg-white after:shadow-sm after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-[18px] peer-checked:after:border-white"></span>
                  </label>
                </div>

                @if (isSectionVisible(section.id)) {
                  <div class="mt-2.5 border-t border-slate-100 pt-2.5">
                    <textarea
                      [formControlName]="getControlName(section.id)"
                      class="min-h-[54px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm leading-relaxed text-slate-800 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      [placeholder]="section.placeholder || 'Type content...'"
                      rows="2"
                    ></textarea>

                    @if (getListId(section.id)) {
                      <div class="relative mt-2">
                        <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input [attr.list]="getListId(section.id)"
                               (change)="onTemplateSelect($event, getControlName(section.id))"
                               class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[11px] font-medium text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                               placeholder="Search saved template...">
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Clean text-only version for print -->
              <div class="hidden print:block"
                   *ngIf="parentForm.get(getControlName(section.id))?.value">
                <h3 class="text-lg font-bold text-gray-900">{{ section.label }}</h3>
                <div class="min-h-[1.5rem] whitespace-pre-wrap py-1 text-sm font-medium leading-relaxed text-gray-800">
                  {{ parentForm.get(getControlName(section.id))?.value || '' }}
                </div>
              </div>
            }
          </div>
        </div>
      }
    
      <!-- Right Column: Rx (Medicines) -->
      <div class="p-6 relative"
        [ngClass]="config.showLeftColumn ? 'w-full md:w-2/3 print:w-2/3' : 'w-full print:w-full'">
    
        <!-- Rx Header -->
        <h2 class="text-4xl font-serif font-bold italic mb-6">{{ config.labelRx }}</h2>
    
        <!-- Medicine List -->
        <div class="space-y-6 print:space-y-4" formArrayName="medicines">
          @for (med of medicines.controls; track $index; let i = $index) {
            <div [formGroupName]=" i" class="group relative">
              <!-- Medicine Name Line -->
              <div class="flex items-baseline gap-2 text-lg">
                <span class="text-sm font-semibold uppercase text-gray-600 w-16 text-right">
                  {{ getMedicineType(i) }}.
                </span>
                <span class="font-bold text-gray-900">{{ getMedicineName(i) }}</span>
                <span class="text-sm text-gray-500">{{ getMedicineStrength(i) }}</span>
                <!-- Remove Button (Hidden in print) -->
                <button type="button" (click)="onRemoveMedicine(i)" class="ml-auto text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden p-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <!-- Dosage & Instructions Line -->
              <div class="pl-20 text-gray-700 font-medium mt-1">
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Dose -->
                  <div class="relative flex-1 min-w-[80px]">
                    <div class="relative print:hidden">
                      <input type="text" formControlName="dosage" autocomplete="off"
                        (focus)="openDoseDropdown(i)" (click)="openDoseDropdown(i)"
                        (input)="onDoseInput($event, i)" (blur)="scheduleDoseDropdownClose(i)"
                        (keydown.escape)="closeDoseDropdown()"
                        class="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent placeholder-gray-300 text-sm"
                        placeholder="1+0+1">
                    </div>

                    @if (activeDoseDropdownIndex === i) {
                      <div class="absolute left-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl shadow-gray-200/70 print:hidden">
                        <div class="flex items-center justify-between border-b border-gray-100 bg-emerald-50 px-3 py-2">
                          <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Select dose</span>
                          <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-600">{{ filteredDoseTemplates().length }}</span>
                        </div>
                        @if (filteredDoseTemplates().length > 0) {
                          <div class="max-h-56 overflow-y-auto p-1.5">
                            @for (dose of filteredDoseTemplates(); track dose) {
                              <button type="button" (mousedown)="$event.preventDefault()" (click)="selectDose(i, dose)"
                                class="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:outline-none">
                                <span>{{ dose }}</span>
                                <svg class="h-4 w-4 text-emerald-500 opacity-0 transition group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                              </button>
                            }
                          </div>
                        } @else {
                          <div class="px-4 py-5 text-center">
                            <p class="text-xs font-bold text-gray-600">No dose template found</p>
                            <p class="mt-1 text-[10px] leading-4 text-gray-400">Add one from Dose Management or type a custom dose.</p>
                          </div>
                        }
                      </div>
                    }
                    <span class="hidden print:block text-gray-800 text-sm font-bold">{{ med.get('dosage')?.value }}</span>
                  </div>
                  
                  <span class="text-gray-400 text-sm">--</span>
                  
                  <!-- Instructions -->
                  <div class="flex-[3] min-w-[150px]">
                    <input type="text" formControlName="instructions" list="adviceList" class="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent placeholder-gray-300 text-sm font-hindi print:hidden" placeholder="instruction">
                    <span class="hidden print:block text-gray-800 text-sm font-medium font-hindi italic">{{ med.get('instructions')?.value }}</span>
                  </div>
                  
                  <span class="text-gray-400 text-sm">--</span>
                  
                  <!-- Duration -->
                  <div class="flex-1 min-w-[80px]">
                    <input type="text" formControlName="duration" list="durationList" class="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent placeholder-gray-300 text-sm print:hidden" placeholder="Duration">
                    <span class="hidden print:block text-gray-800 text-sm font-bold">{{ med.get('duration')?.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <datalist id="adviceList">
          @for (advice of adviceTemplates; track advice) {
            <option [value]="advice"></option>
          }
        </datalist>
        <datalist id="durationList">
          @for (dur of durationTemplates; track dur) {
            <option [value]="dur"></option>
          }
        </datalist>
        <datalist id="ccList">
          @for (item of ccTemplates; track item) {
            <option [value]="item"></option>
          }
        </datalist>
        <datalist id="oeList">
          @for (item of oeTemplates; track item) {
            <option [value]="item"></option>
          }
        </datalist>
        <datalist id="ixList">
          @for (item of ixTemplates; track item) {
            <option [value]="item"></option>
          }
        </datalist>
        <datalist id="dxList">
          @for (item of dxTemplates; track item) {
            <option [value]="item"></option>
          }
        </datalist>
    
        <!-- Add Button (Print Hidden) -->
        <div class="mt-8 pl-16 print:hidden">
          <button type="button" (click)="onAddMedicine()" class="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors text-sm font-bold uppercase tracking-wider">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Medicine
          </button>
        </div>
    
      </div>
    </div>
    `,
  styles: [`
    .font-hindi {
        font-family: 'Noto Sans Bengali', sans-serif;
    }
    .barcode-container svg {
        width: 120px;
        height: 60px;
    }
    @media print {
        @page {
            size: A4;
            margin: 0;
        }
        :host {
            display: block; 
            width: 100%;
            height: 100%;
        }
        /* Target the main container div inside the template */
        :host > div {
             height: 100% !important;
             min-height: 0 !important;
             display: flex !important;
             flex-direction: row !important;
             align-items: stretch !important;
        }

        .min-h-\\[600px\\] {
            min-height: auto !important;
            height: 100%;
        }
        .print\\:block {
            display: block !important;
        }
        
        /* Left Column */
        .print\\:w-1\\/3 {
            width: 30% !important;
            border-right: 2px solid #000; /* Thicker, clearer line */
            height: auto !important; /* Allow it to stretch */
            flex-shrink: 0 !important;
        }

        /* Keep clinical notes clear of printers' non-printable left edge. */
        .clinical-column {
            box-sizing: border-box !important;
            padding-left: 11mm !important;
            padding-right: 5mm !important;
        }

        /* Right Column */
        .print\\:w-2\\/3 {
            width: 70% !important;
            padding-left: 20px;
            height: auto !important;
            flex-grow: 1 !important;
        }
        
        .print\\:w-full {
             width: 100% !important;
        }
    }
  `]
})
export class PrescriptionBodyComponent implements OnChanges, AfterViewInit {
  @Input() parentForm!: FormGroup;
  @Input() config: PrescriptionBodyConfig = DEFAULT_BODY_CONFIG;
  @Input() patient: Patient | null = null;
  @Input() doseTemplates: string[] = [];
  @Input() adviceTemplates: string[] = [];
  @Input() durationTemplates: string[] = [];
  @Input() ccTemplates: string[] = [];
  @Input() oeTemplates: string[] = [];
  @Input() ixTemplates: string[] = [];
  @Input() dxTemplates: string[] = [];

  @Output() addMedicineStr = new EventEmitter<void>();
  @Output() removeMedicineIdx = new EventEmitter<number>();

  @ViewChild('barcodeCanvas') barcodeCanvas!: ElementRef;

  sortedSections: BodySectionConfig[] = [];
  activeDoseDropdownIndex: number | null = null;
  doseSearchQuery = '';
  private doseCloseTimer?: number;

  ngOnChanges() {
    this.updateSortedSections();
    setTimeout(() => this.generateBarcode(), 0);
  }

  ngAfterViewInit() {
    this.generateBarcode();
  }

  private generateBarcode() {
    if (this.barcodeCanvas && this.patient?.id && this.config.showBarcode) {
      try {
        JsBarcode(this.barcodeCanvas.nativeElement, this.patient.id.toString(), {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 40,
          displayValue: false,
          margin: 0
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }

  private updateSortedSections() {
    this.sortedSections = (this.config?.sections || [])
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order);
  }

  trackBySection(index: number, section: BodySectionConfig) {
    return section.id;
  }

  getControlName(id: string): string {
    if (id === 'cc') return 'chiefComplaint';
    if (id === 'oe') return 'onExamination';
    if (id === 'advice') return 'advice';
    if (id === 'ix') return 'investigation';
    if (id === 'investigation') return 'investigation';
    if (id === 'diagnosis') return 'diagnosis';
    if (id === 'disease') return 'disease';
    if (id === 'dh') return 'drugHistory';

    if (this.parentForm.contains(id)) return id;
    return id;
  }

  getToggleControlName(id: string): string {
    switch (id) {
      case 'cc': return 'showChiefComplaint';
      case 'oe': return 'showOnExamination';
      case 'advice': return 'showAdvice';
      case 'ix': return 'showInvestigation';
      case 'investigation': return 'showInvestigation';
      case 'diagnosis': return 'showDiagnosis';
      case 'disease': return 'showDisease';
      case 'dh': return 'showDrugHistory';
      default: return '';
    }
  }

  isSectionVisible(id: string): boolean {
    const ctrlName = this.getToggleControlName(id);
    return ctrlName ? this.parentForm.get(ctrlName)?.value : true;
  }

  getListId(id: string): string {
    switch (id) {
      case 'cc': return 'ccList';
      case 'oe': return 'oeList';
      case 'ix': return 'ixList';
      case 'investigation': return 'ixList';
      case 'advice': return 'adviceList';
      case 'diagnosis': return 'dxList';
      case 'disease': return 'dxList';
      default: return '';
    }
  }

  onTemplateSelect(event: any, controlName: string) {
    const val = event.target.value;
    if (val) {
      const currentVal = this.parentForm.get(controlName)?.value || '';
      const newVal = currentVal ? `${currentVal}\n${val}` : val;
      this.parentForm.get(controlName)?.patchValue(newVal);
      event.target.value = ''; // Reset input
    }
  }

  get medicines() {
    return this.parentForm.get('medicines') as FormArray;
  }

  openDoseDropdown(index: number): void {
    if (this.doseCloseTimer) window.clearTimeout(this.doseCloseTimer);
    this.activeDoseDropdownIndex = index;
    this.doseSearchQuery = '';
  }

  onDoseInput(event: Event, index: number): void {
    this.activeDoseDropdownIndex = index;
    this.doseSearchQuery = (event.target as HTMLInputElement).value;
  }

  filteredDoseTemplates(): string[] {
    const query = this.doseSearchQuery.trim().toLowerCase();
    const uniqueDoses = [...new Set(this.doseTemplates.filter(Boolean))];
    return query
      ? uniqueDoses.filter(dose => dose.toLowerCase().includes(query))
      : uniqueDoses;
  }

  selectDose(index: number, dose: string): void {
    this.medicines.at(index).get('dosage')?.setValue(dose);
    this.closeDoseDropdown();
  }

  scheduleDoseDropdownClose(index: number): void {
    this.doseCloseTimer = window.setTimeout(() => {
      if (this.activeDoseDropdownIndex === index) this.closeDoseDropdown();
    }, 150);
  }

  closeDoseDropdown(): void {
    if (this.doseCloseTimer) window.clearTimeout(this.doseCloseTimer);
    this.doseCloseTimer = undefined;
    this.activeDoseDropdownIndex = null;
    this.doseSearchQuery = '';
  }

  getMedicineName(index: number): string {
    const med = this.medicines.at(index).get('_medicine')?.value;
    return med ? med.medicineName : 'Unknown';
  }

  getMedicineType(index: number): string {
    const med = this.medicines.at(index).get('_medicine')?.value;
    const form = med ? med.form : '';
    if (form === 'Tablet') return 'Tab';
    if (form === 'Capsule') return 'Cap';
    if (form === 'Syrup') return 'Syp';
    if (form === 'Injection') return 'Inj';
    return form || 'Tab';
  }

  getMedicineStrength(index: number): string {
    const med = this.medicines.at(index).get('_medicine')?.value;
    return med ? med.variation || '' : '';
  }

  onAddMedicine() {
    this.addMedicineStr.emit();
  }

  onRemoveMedicine(index: number) {
    this.removeMedicineIdx.emit(index);
  }
}
