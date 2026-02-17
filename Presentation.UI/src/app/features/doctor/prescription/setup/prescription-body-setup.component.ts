import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';
import { PrescriptionBodyComponent } from '../components/prescription-body/prescription-body.component';
import { DEFAULT_BODY_CONFIG, PrescriptionBodyConfig, BodySectionConfig } from '../../../../core/models/prescription-settings.model';
import { PrescriptionSettingsService } from '../../../../core/services/prescription-settings.service';
import { Patient, Gender } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-prescription-body-setup',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DragDropModule, PrescriptionBodyComponent],
  template: `
    <div class="container mx-auto p-6 md:p-12">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Prescription Body Setup</h1>
          <p class="text-gray-500">Customize sections and layout for the main prescription area.</p>
        </div>
        <button (click)="saveConfig()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
          Save Changes
        </button>
      </div>
    
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
        <!-- EDITOR PANEL -->
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-700">Settings Editor</h2>
            <button (click)="addSection()" class="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Add Section
            </button>
          </div>
    
          <div class="p-6 space-y-6 h-[700px] overflow-y-auto">
    
            <!-- Layout Toggles -->
            <div>
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide border-b border-blue-100 pb-1">Master Layout</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <input type="checkbox" [(ngModel)]="localConfig.showLeftColumn" (ngModelChange)="onConfigChange()" id="showLeft" class="h-6 w-6 text-blue-600 rounded cursor-pointer">
                  <div>
                    <label for="showLeft" class="text-gray-900 font-bold block cursor-pointer">Show Left Information Column</label>
                    <p class="text-[11px] text-gray-500">Enable this to show C/C, O/E, and other clinical observations.</p>
                  </div>
                </div>
    
                <!-- Barcode Toggle moved here -->
                <div class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p class="text-sm font-bold text-gray-700 whitespace-nowrap">Show ID Barcode</p>
                    <p class="text-[10px] text-gray-400">Display scannable barcode at the top of left column.</p>
                  </div>
                  <input type="checkbox" [(ngModel)]="localConfig.showBarcode" (ngModelChange)="onConfigChange()" class="h-6 w-6 text-blue-600 rounded cursor-pointer">
                </div>
              </div>
            </div>
    
            <!-- Rx Header -->
            <div class="pt-2">
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide border-b border-blue-100 pb-1">Prescription Branding</h3>
              <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Rx Header Label</label>
                <input type="text" [(ngModel)]="localConfig.labelRx" (ngModelChange)="onConfigChange()"
                  class="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 font-bold text-lg italic font-serif">
                </div>
              </div>
    
              <!-- Dynamic Sections List -->
              <div class="pt-4">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-sm font-bold text-blue-600 uppercase tracking-wide">Left Column Sections</h3>
                  <span class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black tracking-widest uppercase">Drag to Reorder</span>
                </div>
    
                <div cdkDropList (cdkDropListDropped)="drop($event)" class="space-y-3">
                  @for (section of localConfig.sections; track section.id; let i = $index) {
                    <div
                      cdkDrag
                      class="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-blue-300 hover:shadow-soft group">
                      <!-- Drag Handle -->
                      <div cdkDragHandle class="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-blue-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
                      </div>
                      <!-- Toggle -->
                      <input type="checkbox" [(ngModel)]="section.visible" (ngModelChange)="onConfigChange()" class="h-5 w-5 text-blue-600 rounded-md cursor-pointer">
                      <!-- Label Input -->
                      <div class="flex-1">
                        <input type="text" [(ngModel)]="section.label" (ngModelChange)="onConfigChange()"
                          class="w-full text-base border-0 border-b border-dashed border-gray-200 focus:border-blue-500 focus:ring-0 p-1 font-bold text-gray-800"
                          [class.opacity-40]="!section.visible"
                          placeholder="Section Label">
                        </div>
                        <!-- Remove -->
                        <button (click)="removeSection(i)" class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    }
                  </div>
    
                  <!-- Add Section Button -->
                  <button (click)="addSection()"
                    class="mt-4 w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group">
                    <svg class="w-6 h-6 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Add New Left Column Section
                  </button>
                </div>
    
              </div>
            </div>
    
            <!-- PREVIEW PANEL -->
            <div class="flex flex-col">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Live Preview</h2>
                <span class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Sync Active</span>
              </div>
              <div class="bg-gray-200 p-8 rounded-3xl border border-dashed border-gray-400 min-h-[400px] flex items-center justify-center">
                <div class="w-full bg-white shadow-strong scale-95 origin-top min-h-[600px] flex flex-col pt-2">
                  <!-- Mock Header Line -->
                  <div class="h-6 bg-gray-50 mb-3 mx-6 rounded-lg opacity-50"></div>
    
                  <!-- Actual Body Component -->
                  <app-prescription-body [config]="previewConfig" [parentForm]="mockForm" [patient]="mockPatient"></app-prescription-body>
    
                  <div class="flex-1"></div>
                  <!-- Mock Footer Line -->
                  <div class="h-4 bg-gray-50 mt-auto mb-6 mx-6 rounded-lg opacity-50"></div>
                </div>
              </div>
              <p class="mt-4 text-center text-sm text-gray-500 font-medium">Any changes to labels or visibility reflect instantly in the A4 preview.</p>
            </div>
    
          </div>
        </div>
    `,
  styles: [`
    .cdk-drag-preview {
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border-radius: 16px;
        background: white;
        border: 1px solid #3b82f6;
    }
    .cdk-drag-placeholder {
        opacity: 0;
    }
    .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .space-y-3.cdk-drop-list-dragging .bg-white:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class PrescriptionBodySetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(PrescriptionSettingsService);
  private cdr = inject(ChangeDetectorRef);

  localConfig: PrescriptionBodyConfig = JSON.parse(JSON.stringify(DEFAULT_BODY_CONFIG));
  previewConfig: PrescriptionBodyConfig = JSON.parse(JSON.stringify(DEFAULT_BODY_CONFIG));
  mockForm: FormGroup;

  mockPatient: Patient = {
    id: '12345',
    name: 'Rashidul Islam',
    age: 45,
    gender: Gender.MALE,
    address: '123 Main Street, Dhaka',
    phone: '+880-1711-234567',
    weight: '70kg',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor() {
    this.mockForm = this.fb.group({
      cc: [''],
      oe: [''],
      advice: [''],
      medicines: this.fb.array([
        this.fb.group({
          _medicine: [{ medicineName: 'Napa', variation: '500mg', form: 'Tablet' }],
          dosage: ['1+0+1'],
          instructions: ['After Food'],
          duration: ['5 Days']
        })
      ])
    });
  }

  ngOnInit() {
    this.settingsService.getBodyConfig().pipe(take(1)).subscribe(c => {
      this.localConfig = JSON.parse(JSON.stringify(c));
      if (!this.localConfig.sections) {
        this.localConfig.sections = JSON.parse(JSON.stringify(DEFAULT_BODY_CONFIG.sections));
      }
      this.updatePreview();
    });
  }

  trackBySection(index: number, section: any) {
    return section.id;
  }

  onConfigChange() {
    this.updatePreview();
  }

  updatePreview() {
    this.previewConfig = JSON.parse(JSON.stringify(this.localConfig));

    // Ensure mockForm has controls for all sections to avoid errors in component
    this.localConfig.sections.forEach(s => {
      if (!this.mockForm.contains(s.id)) {
        this.mockForm.addControl(s.id, this.fb.control(''));
      }
    });

    this.cdr.detectChanges();
  }

  drop(event: CdkDragDrop<BodySectionConfig[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.localConfig.sections, event.previousIndex, event.currentIndex);
    this.localConfig.sections.forEach((s, idx) => s.order = idx + 1);
    this.updatePreview();
  }

  addSection() {
    const id = 'section_' + Date.now();
    const newSection: BodySectionConfig = {
      id: id,
      label: 'New Section',
      visible: true,
      order: this.localConfig.sections.length + 1,
      placeholder: 'Type content...'
    };
    this.localConfig.sections.push(newSection);
    this.updatePreview();
  }

  removeSection(index: number) {
    if (confirm('Are you sure you want to remove this section?')) {
      this.localConfig.sections.splice(index, 1);
      this.updatePreview();
    }
  }

  saveConfig() {
    this.settingsService.updateBodyConfig(this.localConfig);
    alert('Body Settings Saved Successfully!');
  }
}
