import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';


export interface TableColumn {
  key: string;
  title: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'badge' | 'action';
  sortable?: boolean;
  width?: string;
}

export interface TableData {
  columns: TableColumn[];
  rows: any[];
  total?: number;
  page?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [],
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss']
})
export class TableWidgetComponent implements OnInit, OnChanges {
  @Input() data: TableData | null = null;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() isLoading = false;
  @Input() showPagination = false;
  @Input() maxRows = 10;

  @Output() refresh = new EventEmitter<void>();
  @Output() drillThrough = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  public displayedRows = signal<any[]>([]);
  public sortColumn = signal<string>('');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  ngOnInit(): void {
    this.updateDisplayedRows();
  }

  ngOnChanges(): void {
    this.updateDisplayedRows();
  }

  private updateDisplayedRows(): void {
    if (this.data?.rows) {
      const rows = this.data.rows.slice(0, this.maxRows);
      this.displayedRows.set(rows);
    }
  }

  public onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const currentSort = this.sortColumn();
    const currentDirection = this.sortDirection();

    if (currentSort === column.key) {
      // Toggle direction
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      this.sortDirection.set(newDirection);
    } else {
      // New column
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      column: this.sortColumn(),
      direction: this.sortDirection()
    });
  }

  public getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';

    const isActive = this.sortColumn() === column.key;
    if (!isActive) return 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4';

    return this.sortDirection() === 'asc'
      ? 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12'
      : 'M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4v12';
  }

  public getCellValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  public formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value.toString();
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'status':
        return value.toString();
      default:
        return value.toString();
    }
  }

  public getStatusClass(value: string): string {
    switch (value.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'status-active';
      case 'pending':
      case 'in-progress':
        return 'status-pending';
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  }

  public onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  public onRefresh(): void {
    this.refresh.emit();
  }

  public onDrillThrough(): void {
    this.drillThrough.emit();
  }

}
