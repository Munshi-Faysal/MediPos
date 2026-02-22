import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';
import { PrescriptionHeaderComponent } from '../components/prescription-header/prescription-header.component';
import { DEFAULT_HEADER_CONFIG, PrescriptionHeaderConfig, PatientFieldConfig } from '../../../../core/models/prescription-settings.model';
import { PrescriptionSettingsService } from '../../../../core/services/prescription-settings.service';

@Component({
  selector: 'app-prescription-header-setup',
  standalone: true,
  imports: [FormsModule, DragDropModule, PrescriptionHeaderComponent],
  template: `
    <div class="container mx-auto p-6 md:p-12">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Prescription Header Setup</h1>
          <p class="text-gray-500">Customize the header appearance and details for your prescriptions.</p>
        </div>
        <button (click)="saveConfig()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
          Save Changes
        </button>
      </div>
    
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
        <!-- EDITOR PANEL -->
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 class="text-lg font-bold text-gray-700">Settings Editor</h2>
          </div>
    
          <div class="p-6 space-y-6 h-[700px] overflow-y-auto">
    
            <!-- Doctor Info -->
            <div>
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Doctor Details</h3>
              <div class="grid grid-cols-1 gap-4">

                <!-- Doctor Name -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Doctor Name</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDoctorName" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.doctorName" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDoctorName">
                </div>

                <!-- Designation -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Designation</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDesignation" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.designation" (ngModelChange)="onConfigChange()" placeholder="e.g. Consultant Physician" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDesignation">
                </div>

                <!-- Degrees -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Degrees</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDegrees" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.degrees" (ngModelChange)="onConfigChange()" placeholder="e.g. MBBS, MD" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDegrees">
                </div>

                <!-- Fellowship -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Fellowship / Extra Credentials</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showFellowship" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.fellowship" (ngModelChange)="onConfigChange()" placeholder="e.g. FCPS (Medicine), FRCP" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showFellowship">
                </div>

                <!-- Specialties -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Specialties <span class="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
                    <input type="checkbox" [(ngModel)]="localConfig.showSpecialties" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.specialtiesText" (ngModelChange)="onSpecialtiesChange()" placeholder="e.g. Medicine Specialist, Diabetes Expert" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showSpecialties">
                </div>

                <!-- Department -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDepartment" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.department" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDepartment">
                </div>

                <!-- Institute/Hospital -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Institute/Hospital</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showInstitute" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.institute" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showInstitute">
                </div>

                <!-- Reg No -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">BMDC Reg No</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showRegNo" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.regNo" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showRegNo">
                </div>

                <!-- Email -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showEmail" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="email" [(ngModel)]="localConfig.email" (ngModelChange)="onConfigChange()" placeholder="e.g. doctor@hospital.com" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showEmail">
                </div>

              </div>
            </div>
    
            <!-- Chamber Info -->
            <div class="pt-4 border-t border-gray-100">
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Chamber Details</h3>
              <div class="grid grid-cols-1 gap-4">

                <!-- Logo Upload -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">Chamber Logo</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showChamberLogo" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <div class="flex items-center gap-3">
                    <!-- Preview -->
                    <div class="w-16 h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      @if (localConfig.chamberLogo) {
                        <img [src]="localConfig.chamberLogo" class="w-full h-full object-contain" alt="Logo">
                      } @else {
                        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      }
                    </div>
                    <div class="flex-1 space-y-2">
                      <label class="block w-full cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium py-2 px-3 rounded text-center transition-colors">
                        <svg class="w-4 h-4 inline mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Upload Logo
                        <input type="file" accept="image/*" class="hidden" (change)="onLogoUpload($event)">
                      </label>
                      @if (localConfig.chamberLogo) {
                        <button (click)="removeLogo()" class="w-full text-xs text-red-500 hover:text-red-700 underline">Remove Logo</button>
                      }
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">PNG, JPG, SVG — recommended size 200×100px</p>
                </div>

                <!-- Chamber Name -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Chamber Name</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showChamberName" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.chamberName" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showChamberName">
                </div>

                <!-- Address -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Address</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showChamberAddress" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.chamberAddress" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showChamberAddress">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-sm font-medium text-gray-700">Mobile</label>
                      <input type="checkbox" [(ngModel)]="localConfig.showMobile" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                    </div>
                    <input type="text" [(ngModel)]="localConfig.mobile" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showMobile">
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-sm font-medium text-gray-700">Off Day</label>
                      <input type="checkbox" [(ngModel)]="localConfig.showOffDay" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                    </div>
                    <input type="text" [(ngModel)]="localConfig.offDay" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showOffDay">
                  </div>
                </div>

                <!-- Visit Time -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Visit Time</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showVisitTime" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.visitTime" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showVisitTime">
                </div>
              </div>
            </div>
    
            <!-- Patient Input Toggling & Ordering (Drag system) -->
            <div class="pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm font-bold text-blue-600 uppercase tracking-wide">Patient Input (Ordering & Visibility)</h3>
                <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest px-3 py-1 font-black">DRAG TO REORDER</span>
              </div>
    
              <div cdkDropList [cdkDropListData]="localConfig.patientFields" (cdkDropListDropped)="drop($event)" class="space-y-2">
                @for (field of localConfig.patientFields; track field.id) {
                  <div
                    cdkDrag
                    class="bg-gray-50 border border-gray-200 rounded p-3 flex items-center gap-3 transition-shadow hover:shadow-md group">
                    <!-- Drag Handle -->
                    <div cdkDragHandle class="cursor-grab active:cursor-grabbing text-gray-400 group-hover:text-blue-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
                    </div>
                    <!-- Toggle -->
                    <input type="checkbox" [(ngModel)]="field.visible" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                    <!-- Label Input -->
                    <div class="flex-1">
                      <input type="text" [(ngModel)]="field.label" (ngModelChange)="onConfigChange()"
                        class="w-full text-sm border-0 border-b border-transparent bg-transparent focus:border-blue-500 focus:ring-0 p-0 font-medium text-gray-700"
                        [class.opacity-50]="!field.visible">
                      </div>
                      <div class="text-[10px] font-bold text-gray-300 uppercase select-none">{{ field.id }}</div>
                    </div>
                  }
                </div>
              </div>
    
              <!-- Appearance -->
              <div class="pt-4 border-t border-gray-100">
                <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Appearance</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="localConfig.leftSideBgColor" (ngModelChange)="onConfigChange(); syncColors()" class="h-8 w-14 p-0 border border-gray-300 rounded cursor-pointer text-sm">
                      <input type="text" [(ngModel)]="localConfig.leftSideBgColor" (ngModelChange)="onConfigChange(); syncColors()" class="flex-1 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="localConfig.textColor" (ngModelChange)="onConfigChange()" class="h-8 w-14 p-0 border border-gray-300 rounded cursor-pointer text-sm">
                      <input type="text" [(ngModel)]="localConfig.textColor" (ngModelChange)="onConfigChange()" class="flex-1 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                    </div>
                  </div>
                </div>
              </div>
    
            </div>
          </div>
    
          <!-- PREVIEW PANEL -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">Live Preview</h2>
              <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold uppercase">Real-time Sync</span>
            </div>
            <div class="bg-gray-200 p-8 rounded-xl border border-dotted border-gray-400 min-h-[400px] flex items-center justify-center">
              <div class="w-full bg-white shadow-2xl scale-95 origin-top">
                <app-prescription-header [config]="previewConfig"></app-prescription-header>
              </div>
            </div>
            <p class="mt-4 text-center text-sm text-gray-500">Visibility and order changes reflect instantly in the preview.</p>
          </div>
    
        </div>
      </div>
    `,
  styles: [`
    .cdk-drag-preview {
        box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        border-radius: 4px;
        background: white;
    }
    .cdk-drag-placeholder {
        opacity: 0;
    }
    .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .space-y-2.cdk-drop-list-dragging .bg-gray-50:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class PrescriptionHeaderSetupComponent implements OnInit {
  private settingsService = inject(PrescriptionSettingsService);
  private cdr = inject(ChangeDetectorRef);

  localConfig: PrescriptionHeaderConfig = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG));
  previewConfig: PrescriptionHeaderConfig = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG));

  ngOnInit() {
    this.settingsService.getHeaderConfig().pipe(take(1)).subscribe(c => {
      this.localConfig = JSON.parse(JSON.stringify(c));
      if (!this.localConfig.patientFields) {
        this.localConfig.patientFields = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG.patientFields));
      }
      // Sync specialtiesText from specialties array if not set
      if (!this.localConfig.specialtiesText && this.localConfig.specialties?.length) {
        this.localConfig.specialtiesText = this.localConfig.specialties.join(', ');
      }
      // Ensure new fields have defaults if loading old saved config
      if (this.localConfig.designation === undefined) this.localConfig.designation = '';
      if (this.localConfig.showDesignation === undefined) this.localConfig.showDesignation = false;
      if (this.localConfig.fellowship === undefined) this.localConfig.fellowship = '';
      if (this.localConfig.showFellowship === undefined) this.localConfig.showFellowship = false;
      if (this.localConfig.email === undefined) this.localConfig.email = '';
      if (this.localConfig.showEmail === undefined) this.localConfig.showEmail = false;
      if (this.localConfig.chamberLogo === undefined) this.localConfig.chamberLogo = '';
      if (this.localConfig.showChamberLogo === undefined) this.localConfig.showChamberLogo = false;
      this.updatePreview();
    });
  }

  trackByField(index: number, field: any) {
    return field.id;
  }

  onConfigChange() {
    this.updatePreview();
  }

  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.localConfig.chamberLogo = e.target?.result as string;
      this.localConfig.showChamberLogo = true;
      this.updatePreview();
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.localConfig.chamberLogo = '';
    this.updatePreview();
  }

  onSpecialtiesChange() {
    // Sync text input back to specialties array used by the header component
    this.localConfig.specialties = this.localConfig.specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.updatePreview();
  }

  updatePreview() {
    this.previewConfig = JSON.parse(JSON.stringify(this.localConfig));
    this.cdr.detectChanges();
  }

  drop(event: CdkDragDrop<PatientFieldConfig[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.localConfig.patientFields, event.previousIndex, event.currentIndex);
    this.localConfig.patientFields.forEach((field, index) => {
      field.order = index + 1;
    });
    this.updatePreview();
  }

  syncColors() {
    this.localConfig.rightSideBgColor = this.localConfig.leftSideBgColor;
    this.updatePreview();
  }

  saveConfig() {
    this.settingsService.updateHeaderConfig(this.localConfig);
    alert('Header Settings Saved Successfully!');
  }
}
