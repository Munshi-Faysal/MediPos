import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DynamicButtonComponent, DynamicButtonConfig } from '../dynamic-button/dynamic-button.component';

@Component({
  selector: 'app-dynamic-top-bar',
  standalone: true,
  imports: [FormsModule, DynamicButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 sm:p-4 border-b border-border bg-surface dark:bg-surface">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <!-- Left Section: Search or Custom Content -->
        <div class="flex-1 w-full sm:max-w-md">
          <!-- Search Input -->
          @if (showSearch) {
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="internalSearchQuery"
                (ngModelChange)="onSearchChange($event)"
                [placeholder]="searchPlaceholder || 'Search...'"
                class="form-input pl-9 sm:pl-10 w-full"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            }
            <!-- Custom Left Content Slot -->
            <ng-content select="[slot=left]"></ng-content>
          </div>
    
          <!-- Right Section: Dynamic Buttons -->
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
            @for (button of visibleButtons; track button) {
              <app-dynamic-button
                [config]="button"
                (onClick)="onButtonClick($event)"
              ></app-dynamic-button>
            }
    
            <!-- Custom Right Content Slot -->
            <ng-content select="[slot=right]"></ng-content>
          </div>
        </div>
      </div>
    `,
  styles: []
})
export class DynamicTopBarComponent implements OnChanges {
  @Input() buttons: DynamicButtonConfig[] = [];
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() loading = false;
  @Input() searchQuery = ''; // Allow parent to control search query
  
  @Output() buttonClick = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  internalSearchQuery = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.internalSearchQuery = this.searchQuery;
    }
  }

  get visibleButtons(): DynamicButtonConfig[] {
    return this.buttons.filter(btn => btn.visible !== false);
  }

  onButtonClick(action: string): void {
    this.buttonClick.emit(action);
  }

  onSearchChange(query: string): void {
    this.internalSearchQuery = query;
    this.searchChange.emit(query);
  }
}
