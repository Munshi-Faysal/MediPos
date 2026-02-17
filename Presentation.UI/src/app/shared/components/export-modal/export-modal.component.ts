import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ExportService, ExportFormat, ExportScope, ExportOptions, TableData } from '../../../core/services/export.service';
import { TableColumn } from '../../../core/models';

export interface ExportModalConfig {
  title?: string;
  showSelectedOption?: boolean;
  showPageOption?: boolean;
  showAllOption?: boolean;
  defaultScope?: ExportScope;
  defaultFormat?: ExportFormat;
  filename?: string;
}

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isVisible) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ config?.title || 'Export Data' }}</h3>
            <button
              (click)="close()"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
              >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <!-- Modal Body -->
          <div class="p-6">
            <div class="space-y-6">
              <!-- Export Scope Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  What to export
                </label>
                <div class="space-y-2">
                  @if (config?.showSelectedOption !== false && selectedDataCount > 0) {
                    <div class="flex items-center">
                      <input
                        id="selected"
                        type="radio"
                        [value]="'selected'"
                        [(ngModel)]="selectedScope"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label for="selected" class="ml-3 block text-sm font-medium text-gray-700">
                          Selected Records ({{ selectedDataCount }})
                        </label>
                      </div>
                    }
                    @if (config?.showPageOption !== false) {
                      <div class="flex items-center">
                        <input
                          id="page"
                          type="radio"
                          [value]="'page'"
                          [(ngModel)]="selectedScope"
                          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label for="page" class="ml-3 block text-sm font-medium text-gray-700">
                            Page Records ({{ pageDataCount }})
                          </label>
                        </div>
                      }
                      @if (config?.showAllOption !== false) {
                        <div class="flex items-center">
                          <input
                            id="all"
                            type="radio"
                            [value]="'all'"
                            [(ngModel)]="selectedScope"
                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label for="all" class="ml-3 block text-sm font-medium text-gray-700">
                              All Records ({{ allDataCount }})
                            </label>
                          </div>
                        }
                      </div>
                    </div>
                    <!-- Export Format Selection -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        Export format
                      </label>
                      <div class="space-y-2">
                        <div class="flex items-center">
                          <input
                            id="pdf"
                            type="radio"
                            [value]="'pdf'"
                            [(ngModel)]="selectedFormat"
                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label for="pdf" class="ml-3 block text-sm font-medium text-gray-700">
                              PDF Document
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input
                              id="excel"
                              type="radio"
                              [value]="'excel'"
                              [(ngModel)]="selectedFormat"
                              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              />
                              <label for="excel" class="ml-3 block text-sm font-medium text-gray-700">
                                Excel Spreadsheet
                              </label>
                            </div>
                          </div>
                        </div>
                        <!-- Filename Input -->
                        <div>
                          <label for="filename" class="block text-sm font-medium text-gray-700 mb-2">
                            Filename (optional)
                          </label>
                          <input
                            type="text"
                            id="filename"
                            [(ngModel)]="filename"
                            placeholder="Enter filename"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            <p class="mt-1 text-xs text-gray-500">
                              If not provided, a default name will be used with current date.
                            </p>
                          </div>
                        </div>
                      </div>
                      <!-- Modal Footer -->
                      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                          (click)="close()"
                          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                          type="button"
                          >
                          Cancel
                        </button>
                        <button
                          (click)="export()"
                          [disabled]="!canExport()"
                          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          type="button"
                          >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                }
    `,
  styles: []
})
export class ExportModalComponent implements OnInit {
  private exportService = inject(ExportService);

  @Input() isVisible = false;
  @Input() config: ExportModalConfig | null = null;
  @Input() columns: TableColumn[] = [];
  @Input() allData: TableData[] = [];
  @Input() selectedData: TableData[] = [];
  @Input() pageData: TableData[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() exportComplete = new EventEmitter<void>();

  selectedScope: ExportScope = 'page';
  selectedFormat: ExportFormat = 'pdf';
  filename = '';

  ngOnInit(): void {
    // Set default values from config
    if (this.config) {
      this.selectedScope = this.config.defaultScope || 'page';
      this.selectedFormat = this.config.defaultFormat || 'pdf';
      this.filename = this.config.filename || '';
    }
  }

  get selectedDataCount(): number {
    return this.selectedData.length;
  }

  get pageDataCount(): number {
    return this.pageData.length;
  }

  get allDataCount(): number {
    return this.allData.length;
  }

  canExport(): boolean {
    switch (this.selectedScope) {
      case 'selected':
        return this.selectedDataCount > 0;
      case 'page':
        return this.pageDataCount > 0;
      case 'all':
        return this.allDataCount > 0;
      default:
        return false;
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  export(): void {
    if (!this.canExport()) {
      return;
    }

    try {
      const options: ExportOptions = {
        scope: this.selectedScope,
        format: this.selectedFormat,
        filename: this.filename.trim() || undefined,
        title: this.config?.title || 'Data Export'
      };

      this.exportService.exportData(
        this.columns,
        this.allData,
        this.selectedData,
        this.pageData,
        options
      );

      this.exportComplete.emit();
      this.close();
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to emit an error event here
    }
  }
}
