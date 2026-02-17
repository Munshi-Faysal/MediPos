import { Component, Input } from '@angular/core';

import { PrescriptionFooterConfig, DEFAULT_FOOTER_CONFIG } from '../../../../../core/models/prescription-settings.model';

@Component({
  selector: 'app-prescription-footer',
  standalone: true,
  imports: [],
  template: `
    <div class="footer-container mt-auto print:fixed print:bottom-0 print:left-0 print:w-full" [style.backgroundColor]="config.backgroundColor" [style.color]="config.textColor">
      <div class="border-t-2 border-gray-800 pt-2 pb-4 text-center">
        <p class="text-sm font-semibold">{{ config.disclaimerText }}</p>
      </div>
      @if (config.showCredits) {
        <div class="bg-gray-100 py-2 text-center text-xs text-gray-400">
          {{ config.creditsText }}
        </div>
      }
    </div>
    `
})
export class PrescriptionFooterComponent {
  @Input() config: PrescriptionFooterConfig = DEFAULT_FOOTER_CONFIG;
}
