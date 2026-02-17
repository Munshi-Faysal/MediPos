/**
 * Example Component: How to use DynamicButton with Database MenuActions
 * 
 * This is a reference implementation showing how to load button configurations
 * from the MenuActions table in the database.
 */

import { Component, OnInit, signal, inject } from '@angular/core';

import { DynamicButtonComponent, DynamicButtonConfig } from './dynamic-button.component';
import { ButtonConfigFromDbService } from './button-config-from-db.service';
import { ButtonActionHandlerService } from './button-action-handler.service';

@Component({
  selector: 'app-example-dynamic-buttons',
  standalone: true,
  imports: [DynamicButtonComponent],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Dynamic Buttons from Database</h2>
    
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-gray-500">
          Loading button configurations...
        </div>
      }
    
      <!-- Error State -->
      @if (error()) {
        <div class="text-red-500 mb-4">
          Error: {{ error() }}
        </div>
      }
    
      <!-- Buttons -->
      <div class="flex flex-wrap gap-2">
        @for (button of buttons(); track button) {
          <app-dynamic-button
            [config]="button"
            (onClick)="handleButtonClick($event)"
          ></app-dynamic-button>
        }
      </div>
    
      <!-- Example: Load specific actions -->
      <div class="mt-8">
        <h3 class="text-xl font-semibold mb-2">Specific Actions</h3>
        <div class="flex flex-wrap gap-2">
          @for (button of specificButtons(); track button) {
            <app-dynamic-button
              [config]="button"
              (onClick)="handleButtonClick($event)"
            ></app-dynamic-button>
          }
        </div>
      </div>
    </div>
    `
})
export class ExampleDynamicButtonsComponent implements OnInit {
  private buttonConfigService = inject(ButtonConfigFromDbService);
  private actionHandler = inject(ButtonActionHandlerService);

  buttons = signal<DynamicButtonConfig[]>([]);
  specificButtons = signal<DynamicButtonConfig[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadAllButtons();
    this.loadSpecificButtons();
  }

  /**
   * Load all active menu actions from database
   */
  loadAllButtons() {
    this.isLoading.set(true);
    this.error.set(null);

    this.buttonConfigService.getAllButtonConfigs().subscribe({
      next: (configs) => {
        this.buttons.set(configs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading buttons:', err);
        this.error.set('Failed to load button configurations');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load specific actions by name
   */
  loadSpecificButtons() {
    this.buttonConfigService.getButtonConfigsByActionNames([
      'Create',
      'Edit',
      'Delete',
      'Export',
      'Refresh'
    ]).subscribe({
      next: (configs) => {
        this.specificButtons.set(configs);
      },
      error: (err) => {
        console.error('Error loading specific buttons:', err);
      }
    });
  }

  /**
   * Handle button click using action handler service
   */
  handleButtonClick(action: string) {
    const handlers = this.actionHandler.createHandlerWithDefaults({
      onCreate: () => {
        console.log('Create clicked');
        alert('Create action triggered');
      },
      onEdit: () => {
        console.log('Edit clicked');
        alert('Edit action triggered');
      },
      onDelete: () => {
        console.log('Delete clicked');
        alert('Delete action triggered');
      },
      onExport: () => {
        console.log('Export clicked');
        alert('Export action triggered');
      },
      onRefresh: () => {
        console.log('Refresh clicked');
        this.loadAllButtons();
      }
    });

    handlers(action);
  }
}
