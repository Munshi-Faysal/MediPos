# Dynamic Button Component

A reusable button component that can load configurations from the database (MenuActions table).

## Features

- Loads button configurations from database MenuActions
- Uses description field as tooltip
- Supports SVG icons, Font Awesome icons, and predefined icons
- Fully customizable with variants, sizes, and states

## Loading Buttons from Database

### Using ButtonConfigFromDbService

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { ButtonConfigFromDbService } from '@shared/components/dynamic-button/button-config-from-db.service';
import { DynamicButtonConfig } from '@shared/components/dynamic-button/dynamic-button.component';

@Component({
  selector: 'app-example',
  template: `
    <div class="flex gap-2">
      <app-dynamic-button
        *ngFor="let button of buttons()"
        [config]="button"
        (onClick)="handleButtonClick($event)"
      ></app-dynamic-button>
    </div>
  `
})
export class ExampleComponent implements OnInit {
  buttons = signal<DynamicButtonConfig[]>([]);

  constructor(
    private buttonConfigService: ButtonConfigFromDbService
  ) {}

  ngOnInit() {
    // Load specific actions by name
    this.buttonConfigService.getButtonConfigsByActionNames([
      'Create',
      'Delete',
      'Edit',
      'Export'
    ]).subscribe(configs => {
      this.buttons.set(configs);
    });

    // Or load all active actions
    // this.buttonConfigService.getAllButtonConfigs().subscribe(configs => {
    //   this.buttons.set(configs);
    // });
  }

  handleButtonClick(action: string) {
    console.log('Button clicked:', action);
    // Handle the action
  }
}
```

### Loading Single Button by Action Name

```typescript
// Load a single button configuration
this.buttonConfigService.getButtonConfigByActionName('Create')
  .subscribe(config => {
    if (config) {
      // Use the config
      this.createButtonConfig = config;
    }
  });
```

## Button Configuration Mapping

The service automatically maps MenuAction fields to DynamicButtonConfig:

- **Name** → `label` and `action` (normalized)
- **Icon** → `icon` (supports SVG paths, Font Awesome classes, or predefined names)
- **Description** → `tooltip` (shown on hover)
- **IsActive** → `disabled` and `visible`

## Icon Support

The component supports three types of icons:

1. **Predefined Icons**: 'add', 'delete', 'edit', 'export', 'import', 'refresh', 'print', 'duplicate', 'save', 'cancel'
2. **Font Awesome**: 'fa fa-book', 'fas fa-check', etc.
3. **SVG Paths**: Direct SVG path data (e.g., 'M12 4v16m8-8H4')

## Example Usage in Component

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { ButtonConfigFromDbService } from '@shared/components/dynamic-button/button-config-from-db.service';
import { DynamicButtonConfig } from '@shared/components/dynamic-button/dynamic-button.component';

@Component({
  selector: 'app-my-component',
  template: `
    <div class="flex gap-2 mb-4">
      <app-dynamic-button
        *ngFor="let btn of actionButtons()"
        [config]="btn"
        (onClick)="onActionClick($event)"
      ></app-dynamic-button>
    </div>
  `
})
export class MyComponent implements OnInit {
  actionButtons = signal<DynamicButtonConfig[]>([]);

  constructor(
    private buttonConfigService: ButtonConfigFromDbService
  ) {}

  ngOnInit() {
    // Load buttons from database
    this.loadActionButtons();
  }

  loadActionButtons() {
    this.buttonConfigService.getButtonConfigsByActionNames([
      'Create',
      'Edit',
      'Delete',
      'Export',
      'Refresh'
    ]).subscribe({
      next: (configs) => {
        this.actionButtons.set(configs);
      },
      error: (error) => {
        console.error('Error loading button configs:', error);
      }
    });
  }

  onActionClick(action: string) {
    switch (action) {
      case 'create':
        this.handleCreate();
        break;
      case 'edit':
        this.handleEdit();
        break;
      case 'delete':
        this.handleDelete();
        break;
      case 'export':
        this.handleExport();
        break;
      case 'refresh':
        this.handleRefresh();
        break;
    }
  }

  handleCreate() {
    // Your create logic
  }

  handleEdit() {
    // Your edit logic
  }

  handleDelete() {
    // Your delete logic
  }

  handleExport() {
    // Your export logic
  }

  handleRefresh() {
    // Your refresh logic
  }
}
```

## Tooltip

The tooltip automatically uses the `description` field from the MenuAction table. If no description is provided, it falls back to the action name.

## Caching

The service caches menu actions after the first load to improve performance. To refresh:

```typescript
this.buttonConfigService.refreshMenuActions().subscribe();
```
