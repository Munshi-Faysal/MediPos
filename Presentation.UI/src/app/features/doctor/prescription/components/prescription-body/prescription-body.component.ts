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
        <div class="w-full md:w-1/3 border-r border-gray-800 pt-2 px-4 pb-4 space-y-4 print:w-1/3 relative">
          <div class="absolute inset-y-0 right-0 w-px bg-gray-800 print:hidden"></div> <!-- Vertical Line -->
          <!-- Barcode at TOP of left column -->
          @if (config.showBarcode && patient?.id) {
            <div class="mb-6 flex flex-col items-center">
              <div class="barcode-container bg-white p-1 pb-0 rounded">
                <svg #barcodeCanvas></svg>
              </div>
              <p class="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-tight">Reg: {{ patient?.id }}</p>
            </div>
          }
          @for (section of sortedSections; track section.id) {
            <div class="space-y-1 pl-16">
              <div class="flex items-center gap-2 overflow-hidden">
                <h3 class="font-bold text-lg text-gray-900 whitespace-nowrap shrink-0" 
                    [class.print:hidden]="!parentForm.get(getControlName(section.id))?.value">
                  {{ section.label }}
                </h3>
                <!-- Toggle (Hidden in print) -->
                <label class="inline-flex items-center cursor-pointer print:hidden shrink-0 ml-1">
                  <input type="checkbox" [formControlName]="getToggleControlName(section.id)" class="sr-only peer">
                  <div class="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 relative"></div>
                </label>

                <!-- Template Search (Hidden in print) -->
                @if (isSectionVisible(section.id) && getListId(section.id)) {
                  <input [attr.list]="getListId(section.id)" 
                         (change)="onTemplateSelect($event, getControlName(section.id))" 
                         class="w-24 text-[10px] border border-gray-200 rounded px-1.5 py-0.5 focus:border-blue-400 focus:outline-none bg-white placeholder-gray-300 print:hidden font-medium truncate" 
                         placeholder="Template...">
                }
              </div>
              
                <div class="relative group pl-1">
                  <!-- Textarea for Screen (Visible only if toggled ON) -->
                  <div [class.hidden]="!isSectionVisible(section.id)" class="print:hidden">
                    <textarea
                      [formControlName]="getControlName(section.id)"
                      class="w-full bg-transparent border-0 focus:ring-0 resize-none p-0 text-gray-800 placeholder-gray-300 min-h-[25px] leading-snug"
                      [placeholder]="section.placeholder || 'Type content...'"
                      rows="1"
                    ></textarea>
                  </div>
                  
                  <!-- Text display for Print (ALWAYS visible in print if there is content, regardless of toggle) -->
                  <div class="hidden print:block text-gray-800 text-sm font-medium whitespace-pre-wrap leading-relaxed py-1 min-h-[1.5rem]"
                       *ngIf="parentForm.get(getControlName(section.id))?.value">
                    {{ parentForm.get(getControlName(section.id))?.value || '' }}
                  </div>
                </div>
            </div>
          }
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
                  <div class="relative flex-1 min-w-[180px]">
                    <div class="flex items-end gap-1 print:hidden">
                      <label class="min-w-0 flex-1 text-center">
                        <span class="mb-0.5 block text-[8px] font-bold uppercase tracking-wide text-amber-600">Morning</span>
                        <input type="text" [value]="getDosePart(i, 0)" autocomplete="off" aria-label="Morning dose"
                          (focus)="focusDosePart($event, i)" (input)="updateDosePart($event, i, 0)"
                          (blur)="scheduleDoseDropdownClose(i)" (keydown.escape)="closeDoseDropdown()"
                          class="w-full rounded-md border border-amber-200 bg-amber-50 px-1 py-1.5 text-center text-xs font-extrabold text-gray-800 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                          placeholder="0">
                      </label>
                      <span class="pb-1.5 text-xs font-bold text-gray-300">+</span>
                      <label class="min-w-0 flex-1 text-center">
                        <span class="mb-0.5 block text-[8px] font-bold uppercase tracking-wide text-sky-600">Noon</span>
                        <input type="text" [value]="getDosePart(i, 1)" autocomplete="off" aria-label="Noon dose"
                          (focus)="focusDosePart($event, i)" (input)="updateDosePart($event, i, 1)"
                          (blur)="scheduleDoseDropdownClose(i)" (keydown.escape)="closeDoseDropdown()"
                          class="w-full rounded-md border border-sky-200 bg-sky-50 px-1 py-1.5 text-center text-xs font-extrabold text-gray-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                          placeholder="0">
                      </label>
                      <span class="pb-1.5 text-xs font-bold text-gray-300">+</span>
                      <label class="min-w-0 flex-1 text-center">
                        <span class="mb-0.5 block text-[8px] font-bold uppercase tracking-wide text-indigo-600">Night</span>
                        <input type="text" [value]="getDosePart(i, 2)" autocomplete="off" aria-label="Night dose"
                          (focus)="focusDosePart($event, i)" (input)="updateDosePart($event, i, 2)"
                          (blur)="scheduleDoseDropdownClose(i)" (keydown.escape)="closeDoseDropdown()"
                          class="w-full rounded-md border border-indigo-200 bg-indigo-50 px-1 py-1.5 text-center text-xs font-extrabold text-gray-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          placeholder="0">
                      </label>
                      <button type="button" (mousedown)="$event.preventDefault()" (click)="openDoseDropdown(i)"
                        class="mb-px flex h-8 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600" title="Show saved dose templates">
                        <svg class="h-4 w-4 transition-transform" [class.rotate-180]="activeDoseDropdownIndex === i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
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

  focusDosePart(event: Event, index: number): void {
    this.openDoseDropdown(index);
    (event.target as HTMLInputElement).select();
  }

  getDosePart(index: number, partIndex: number): string {
    return this.splitDose(this.medicines.at(index).get('dosage')?.value || '')[partIndex];
  }

  updateDosePart(event: Event, index: number, partIndex: number): void {
    const parts = this.splitDose(this.medicines.at(index).get('dosage')?.value || '');
    parts[partIndex] = (event.target as HTMLInputElement).value;
    const hasValue = parts.some(part => part.trim());
    const dose = hasValue ? parts.map(part => part.trim() || '0').join('+') : '';
    this.medicines.at(index).get('dosage')?.setValue(dose);
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

  private splitDose(dose: string): [string, string, string] {
    if (!dose) return ['', '', ''];
    const parts = dose.split('+').map(part => part.trim());
    return [parts[0] || '0', parts[1] || '0', parts.slice(2).join('+') || '0'];
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
