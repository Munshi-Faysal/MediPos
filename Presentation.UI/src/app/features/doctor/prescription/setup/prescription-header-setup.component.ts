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
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Doctor Name</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDoctorName" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.doctorName" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDoctorName">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Degrees</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDegrees" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.degrees" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDegrees">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showDepartment" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.department" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showDepartment">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Institute/Hospital</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showInstitute" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.institute" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showInstitute">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Reg No</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showRegNo" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.regNo" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showRegNo">
                </div>
              </div>
            </div>
    
            <!-- Chamber Info -->
            <div class="pt-4 border-t border-gray-100">
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Chamber Details</h3>
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700">Chamber Name</label>
                    <input type="checkbox" [(ngModel)]="localConfig.showChamberName" (ngModelChange)="onConfigChange()" class="h-4 w-4 text-blue-600 rounded">
                  </div>
                  <input type="text" [(ngModel)]="localConfig.chamberName" (ngModelChange)="onConfigChange()" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" [class.opacity-50]="!localConfig.showChamberName">
                </div>
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
      this.updatePreview();
    });
  }

  trackByField(index: number, field: any) {
    return field.id;
  }

  onConfigChange() {
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
