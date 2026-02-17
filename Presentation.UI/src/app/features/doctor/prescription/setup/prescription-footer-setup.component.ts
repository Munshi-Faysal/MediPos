import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PrescriptionFooterComponent } from '../components/prescription-footer/prescription-footer.component';
import { DEFAULT_FOOTER_CONFIG, PrescriptionFooterConfig } from '../../../../core/models/prescription-settings.model';
import { PrescriptionSettingsService } from '../../../../core/services/prescription-settings.service';

@Component({
    selector: 'app-prescription-footer-setup',
    standalone: true,
    imports: [FormsModule, PrescriptionFooterComponent],
    template: `
    <div class="container mx-auto p-6 md:p-12">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Prescription Footer Setup</h1>
          <p class="text-gray-500">Customize the disclaimer and footer appearance.</p>
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
    
          <div class="p-6 space-y-6">
    
            <!-- Content -->
            <div>
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Content</h3>
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Disclaimer Text</label>
                  <textarea [(ngModel)]="config.disclaimerText" rows="2" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
    
                <div class="flex items-center gap-3">
                  <input type="checkbox" [(ngModel)]="config.showCredits" id="showCreds" class="h-5 w-5 text-blue-600 rounded">
                  <label for="showCreds" class="text-gray-700 font-medium">Show System Credits</label>
                </div>
    
                @if (config.showCredits) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Credits Text</label>
                    <input type="text" [(ngModel)]="config.creditsText" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                  </div>
                }
              </div>
            </div>
    
            <!-- Styling -->
            <div class="pt-4 border-t border-gray-100">
              <h3 class="text-sm font-bold text-blue-600 uppercase mb-3 tracking-wide">Appearance</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div class="flex items-center gap-2">
                    <input type="color" [(ngModel)]="config.backgroundColor" class="h-8 w-14 p-0 border border-gray-300 rounded cursor-pointer">
                    <input type="text" [(ngModel)]="config.backgroundColor" class="flex-1 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <div class="flex items-center gap-2">
                    <input type="color" [(ngModel)]="config.textColor" class="h-8 w-14 p-0 border border-gray-300 rounded cursor-pointer">
                    <input type="text" [(ngModel)]="config.textColor" class="flex-1 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                  </div>
                </div>
              </div>
            </div>
    
          </div>
        </div>
    
        <!-- PREVIEW PANEL -->
        <div class="flex flex-col">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Live Preview</h2>
          <div class="bg-gray-200 p-8 rounded-xl border border-dotted border-gray-400 min-h-[300px] flex items-center justify-center">
            <div class="w-full bg-white shadow-2xl scale-100 origin-center flex flex-col min-h-[150px] justify-end">
              <!-- Mock Content -->
              <div class="p-8 text-center font-bold text-2xl uppercase tracking-widest select-none" style="color: #ccc;">
                (Body Content Here)
              </div>
    
              <app-prescription-footer [config]="config"></app-prescription-footer>
            </div>
          </div>
        </div>
    
      </div>
    </div>
    `
})
export class PrescriptionFooterSetupComponent implements OnInit {
    private settingsService = inject(PrescriptionSettingsService);

    config: PrescriptionFooterConfig = { ...DEFAULT_FOOTER_CONFIG };

    ngOnInit() {
        this.settingsService.getFooterConfig().subscribe(c => {
            this.config = { ...c };
        });
    }

    saveConfig() {
        this.settingsService.updateFooterConfig(this.config);
        alert('Footer Settings Saved Successfully!');
    }
}
