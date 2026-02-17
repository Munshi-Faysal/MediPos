# Dynamic Button & Top Bar Usage Example

This example shows how to use the dynamic button component in the dynamic table's top bar.

## Example: Delete Selected and Export Buttons

```typescript
import { Component } from '@angular/core';
import { DynamicTableComponent } from '@app/shared/components/dynamic-table/dynamic-table.component';
import { DynamicButtonConfig } from '@app/shared/components/dynamic-button/dynamic-button.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [DynamicTableComponent],
  template: `
    <app-dynamic-table
      [columns]="columns"
      [dataInput]="data"
      [loading]="loading"
      [topBarButtons]="topBarButtons"
      [showCheckbox]="true"
      (topBarButtonClick)="onTopBarButtonClick($event)"
      (selectionChange)="onSelectionChange($event)"
    ></app-dynamic-table>
  `
})
export class ExampleComponent {
  columns = [/* your columns */];
  data = [/* your data */];
  loading = false;
  selectedRows: any[] = [];

  // Configure top bar buttons
  topBarButtons: DynamicButtonConfig[] = [
    {
      label: 'Delete Selected',
      action: 'deleteSelected',
      variant: 'danger',
      icon: 'delete',
      size: 'md',
      visible: true,
      disabled: false,
      tooltip: 'Delete selected items'
    },
    {
      label: 'Export',
      action: 'export',
      variant: 'outline',
      icon: 'export',
      size: 'md',
      tooltip: 'Export data'
    }
  ];

  onTopBarButtonClick(action: string): void {
    switch (action) {
      case 'deleteSelected':
        if (this.selectedRows.length > 0) {
          if (confirm(`Are you sure you want to delete ${this.selectedRows.length} item(s)?`)) {
            this.deleteSelected();
          }
        } else {
          alert('Please select at least one item to delete.');
        }
        break;
      case 'export':
        this.exportData();
        break;
    }
  }

  onSelectionChange(selected: any[]): void {
    this.selectedRows = selected;
    // Update button disabled state based on selection
    const deleteButton = this.topBarButtons.find(btn => btn.action === 'deleteSelected');
    if (deleteButton) {
      deleteButton.disabled = selected.length === 0;
    }
  }

  deleteSelected(): void {
    // Implement delete logic
    console.log('Deleting:', this.selectedRows);
    // Update your data source
  }

  exportData(): void {
    // Implement export logic
    console.log('Exporting data');
  }
}
```

## Button Variants

- `primary`: Primary action button (blue)
- `secondary`: Secondary action button
- `outline`: Outlined button
- `ghost`: Ghost/transparent button
- `danger`: Dangerous action button (red)

## Available Icons

Predefined icon names:
- `delete` - Delete icon
- `export` - Export/download icon
- `refresh` - Refresh icon
- `add` - Add/plus icon
- `edit` - Edit icon
- `save` - Save/check icon
- `cancel` - Cancel/X icon

Or provide a custom SVG path string.

