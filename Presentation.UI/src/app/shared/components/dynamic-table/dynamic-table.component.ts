import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, computed, TemplateRef, ContentChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import type { TableColumn, PaginationParams, ApiResponse } from '../../../core/models';
import { DynamicTopBarComponent } from '../dynamic-top-bar/dynamic-top-bar.component';
import { DynamicButtonConfig } from '../dynamic-button/dynamic-button.component';

// Re-export TableColumn for convenience (as a type)
export type { TableColumn } from '../../../core/models';

export type TableData = Record<string, any>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicTopBarComponent],
  template: `
    <div class="card">
      <!-- Dynamic Top Bar -->
      @if (topBarButtons && topBarButtons.length > 0) {
        <app-dynamic-top-bar
          [buttons]="getTopBarButtons()"
          [showSearch]="showSearch"
          [searchPlaceholder]="searchPlaceholder"
          [loading]="loading"
          [searchQuery]="searchQuery"
          (buttonClick)="onTopBarButtonClick($event)"
          (searchChange)="onSearchChange($event)"
        ></app-dynamic-top-bar>
      }
    
      <!-- Legacy Table Header with Search and Actions (for backward compatibility) -->
      @if (!topBarButtons || topBarButtons.length === 0) {
        <div class="p-3 sm:p-4 border-b border-border">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <!-- Search -->
            @if (showSearch) {
              <div class="flex-1 w-full sm:max-w-md">
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onSearchChange($event)"
                    placeholder="Search..."
                    class="form-input pl-9 sm:pl-10 w-full"
                    />
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 sm:h-5 sm:w-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            }
            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              @if (showRefresh) {
                <button
                  (click)="onRefresh()"
                  class="btn-ghost min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]"
                  [disabled]="loading"
                  title="Refresh"
                  >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              }
              @if (showExport) {
                <button
                  (click)="onExport()"
                  class="btn-outline text-xs sm:text-sm"
                  [disabled]="loading"
                  >
                  <svg class="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="hidden sm:inline">Export</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
    
      <!-- Table -->
      <div class="table-responsive overflow-y-auto" style="max-height: calc(100vh - 400px);">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-200 dark:border-primary-800 sticky top-0 z-20 shadow-sm">
            <tr>
              <!-- Checkbox column header -->
              @if (showCheckbox) {
                <th class="px-3 py-2 sm:px-4 sm:py-2 text-left w-12">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    [indeterminate]="isIndeterminate()"
                    (change)="onSelectAll($event)"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded cursor-pointer"
                    />
                </th>
              }
              @for (column of columns; track column) {
                <th
                  [class]="getColumnClasses(column)"
                  [style.width]="column.width"
                  >
                  <div class="flex items-center gap-2">
                    <span class="text-xs sm:text-sm font-bold text-primary-900 dark:text-primary-900 uppercase tracking-wide">{{ column.title }}</span>
                    @if (column.sortable && column.key !== 'actions' && column.key !== 'sl') {
                      <button
                        (click)="onSort(column.key)"
                        class="p-1 sm:p-1.5  dark:text-primary-900 hover:bg-primary-900 dark:hover:bg-primary-800/40 rounded min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                        [class.text-primary-700]="sortColumn === column.key"
                        [class.dark:text-primary-300]="sortColumn === column.key"
                        >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            [attr.d]="getSortIcon(column.key)"
                          ></path>
                        </svg>
                      </button>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="bg-surface dark:bg-surface divide-y divide-border">
            <!-- Loading State -->
            @if (loading) {
              <tr>
                <td [attr.colspan]="getColspan()" class="px-3 sm:px-6 py-8 sm:py-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p class="text-sm sm:text-base text-on-surface-variant">Loading...</p>
                  </div>
                </td>
              </tr>
            }
    
            <!-- Empty State -->
            @if (!loading && paginatedData().length === 0) {
              <tr>
                <td [attr.colspan]="getColspan()" class="px-3 sm:px-6 py-8 sm:py-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <svg class="h-10 w-10 sm:h-12 sm:w-12 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <div>
                      <p class="text-sm sm:text-base text-on-surface font-medium">No data found</p>
                      <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Try adjusting your search or filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            }
    
            <!-- Data Rows -->
            @for (row of paginatedData(); track row['id'] || $index) {
              <tr
                class="hover:bg-surface-variant transition-colors duration-150"
                [class.cursor-pointer]="selectable"
                [title]="selectable ? 'Click for edit' : ''"
                (click)="onRowClick(row)"
                >
                <!-- Checkbox column cell -->
                @if (showCheckbox) {
                  <td class="px-3 py-1.5 sm:px-4 sm:py-2" (click)="$event.stopPropagation()">
                    <input
                      type="checkbox"
                      [checked]="isRowSelected(row)"
                      (change)="onRowSelectChange(row, $event)"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded cursor-pointer"
                      />
                  </td>
                }
                @for (column of columns; track column) {
                  <td
                    [class]="getCellClasses(column)"
                    (click)="column.key === 'actions' ? $event.stopPropagation() : null"
                    >
                    <!-- ✅ Actions column -->
                    @if (column.key === 'actions') {
                      @if (actionsTemplate) {
                        <ng-container
                          [ngTemplateOutlet]="actionsTemplate"
                          [ngTemplateOutletContext]="{ $implicit: row }">
                        </ng-container>
                      } @else {
                        <button class="btn btn-sm btn-outline" (click)="onActionClick($event, row)">
                          <i class="fa fa-ellipsis-h"></i>
                        </button>
                      }
                      <!-- fallback if no template provided -->
                      <ng-template #defaultActions>
                        <button class="btn btn-sm btn-outline" (click)="onActionClick($event, row)">
                          <i class="fa fa-ellipsis-h"></i>
                        </button>
                      </ng-template>
                    }
                    <!-- ✅ Default columns -->
                    @if (column.key !== 'actions') {
                      <span class="break-words">{{ formatCellValue(row[column.key], column) }}</span>
                    }
                  </td>
                }
                <!-- <td
                *ngFor="let column of columns"
                [class]="getCellClasses(column)"
                (click)="$event.stopPropagation()"
                >
                <ng-container *ngIf="column.key === 'actions'">
                  <ng-container
                    *ngIf="actionsTemplate; else defaultActions"
                    [ngTemplateOutlet]="actionsTemplate"
                    [ngTemplateOutletContext]="{ $implicit: row }">
                  </ng-container>
                  <ng-template #defaultActions>
                    <span [innerHTML]="getSafeHtml(column, row)" (click)="onActionClick($event, row)"></span>
                  </ng-template>
                </ng-container>
              </td> -->
            </tr>
          }
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    @if (showPagination) {
      <div class="px-3 sm:px-6 py-3 sm:py-4 bg-primary-50/50 dark:bg-primary-900/10 border-t-2 border-primary-200 dark:border-primary-800">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <!-- Page Info -->
          <div class="text-xs sm:text-sm font-medium text-primary-900 dark:text-primary-100 text-center sm:text-left">
            Showing {{ startItem() }} to {{ endItem() }} of {{ serverSidePagination ? totalItems : (filteredData().length || totalItems) }} results
          </div>
          <!-- Pagination Controls -->
          <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
            <!-- Page Size Selector -->
            <div class="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <label class="text-xs sm:text-sm font-medium text-primary-900 dark:text-primary-100 whitespace-nowrap">Show:</label>
              <select
                [ngModel]="pageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="form-input py-1.5 sm:py-1 px-2 sm:px-5 text-xs sm:text-sm min-h-[44px] sm:min-h-[40px] bg-white dark:bg-surface border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-100 focus:border-primary-500 dark:focus:border-primary-500"
                >
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size">{{ size }}</option>
                }
              </select>
            </div>
            <!-- Page Navigation -->
            <div class="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
              <button
                (click)="goToPage(1)"
                [disabled]="currentPageSignal() === 1"
                class="p-2 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] rounded-md transition-colors text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="First page"
                >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                (click)="goToPage(currentPageSignal() - 1)"
                [disabled]="currentPageSignal() === 1"
                class="p-2 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] rounded-md transition-colors text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Previous page"
                >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <!-- Page Numbers -->
              <div class="flex items-center gap-1">
                @for (page of visiblePages(); track page) {
                  @if (isPageNumber(page)) {
                    <button
                      (click)="goToPage(getPageNumber(page))"
                    [class]="getPageNumber(page) === currentPageSignal() 
                      ? 'px-3 sm:px-3 py-1.5 sm:py-1 min-h-[44px] sm:min-h-[40px] bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-md shadow-sm' 
                      : 'px-3 sm:px-3 py-1.5 sm:py-1 min-h-[44px] sm:min-h-[40px] text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 rounded-md transition-colors font-medium'"
                      class="text-xs sm:text-sm"
                      >
                      {{ page }}
                    </button>
                  }
                  @if (!isPageNumber(page)) {
                    <span
                      class="px-2 text-primary-600 dark:text-primary-400 font-medium"
                      >
                      ...
                    </span>
                  }
                }
              </div>
              <button
                (click)="goToPage(currentPageSignal() + 1)"
                [disabled]="currentPageSignal() === totalPages()"
                class="p-2 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] rounded-md transition-colors text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Next page"
                >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button
                (click)="goToPage(totalPages())"
                [disabled]="currentPageSignal() === totalPages()"
                class="p-2 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] rounded-md transition-colors text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Last page"
                >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
    </div>
    `,
  styles: [`
    .table-responsive {
      position: relative;
    }
    .table-responsive thead th {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: rgb(239 246 255); /* primary-50 */
    }
    .dark .table-responsive thead th {
      background-color: rgb(30 58 138 / 0.2); /* primary-900/20 */
    }
  `]
})
export class DynamicTableComponent implements OnInit, OnChanges {
  private sanitizer = inject(DomSanitizer);


  @Input() columns: TableColumn[] = [];
  @Input()
  set data(value: TableData[] | undefined) {
    const safe = value || [];
    this.dataSignal.set(safe);
    // keep compatibility with legacy property name
    this._dataInput = safe;
  }

  // legacy storage for backward compatibility
  private _dataInput: TableData[] = [];
  @Input() loading = false;
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() showPagination = true;
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() showRefresh = true;
  @Input() showExport = false;
  @Input() selectable = false;
  @Input() showCheckbox = false; // Show checkbox column for selection
  @Input() sortColumn = '';
  @Input() sortOrder: 'asc' | 'desc' = 'asc';
  @Input() serverSidePagination = false; // When true, use totalItems instead of filteredData.length
  @Input() topBarButtons: DynamicButtonConfig[] = [];

  @Output() pageChange = new EventEmitter<PaginationParams>();
  @Output() sortChange = new EventEmitter<{ column: string; order: 'asc' | 'desc' }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<TableData>();
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>();
  @Output() selectionChange = new EventEmitter<TableData[]>();
  @Output() topBarButtonClick = new EventEmitter<string>(); // Emitted when a top bar button is clicked

  @ContentChild('actionsTemplate', { static: false }) actionsTemplate?: TemplateRef<any>;

  // Signals for reactive programming
  public dataSignal = signal<TableData[]>([]);
  public searchQuery = '';
  public filteredData = signal<TableData[]>([]);
  public totalItemsSignal = signal<number>(0);
  public pageSizeSignal = signal<number>(10);
  public currentPageSignal = signal<number>(1);
  public selectedRows = signal<Set<string | number>>(new Set());

  // Computed properties
  public totalPages = computed(() => {
    if (this.serverSidePagination) {
      const size = this.pageSizeSignal();
      const total = this.totalItemsSignal();
      if (total <= 0 || size <= 0) {
        return 0;
      }
      const pages = Math.ceil(total / size);
      return pages > 0 ? pages : 1; // At least show 1 page
    }
    const total = this.filteredData().length || this.totalItemsSignal();
    const size = this.pageSizeSignal();
    if (size <= 0) {
      return 0;
    }
    return Math.ceil(total / size);
  });
  public startItem = computed(() => {
    if (this.serverSidePagination) {
      const page = this.currentPageSignal();
      const size = this.pageSizeSignal();
      if (page <= 0 || size <= 0) {
        return 1;
      }
      return (page - 1) * size + 1;
    }
    const total = this.filteredData().length || this.totalItemsSignal();
    const page = this.currentPageSignal();
    const size = this.pageSizeSignal();
    if (page <= 0 || size <= 0) {
      return 1;
    }
    return (page - 1) * size + 1;
  });
  public endItem = computed(() => {
    if (this.serverSidePagination) {
      // For server-side pagination, calculate based on current page and page size
      const page = this.currentPageSignal();
      const size = this.pageSizeSignal();
      const totalItems = this.totalItemsSignal();

      if (totalItems <= 0) {
        // If no total items yet, return the actual data length
        return this.dataSignal().length;
      }

      const currentPageEnd = page * size;
      const calculatedEnd = Math.min(currentPageEnd, totalItems);

      // If calculated end is 0 but we have data, use data length
      if (calculatedEnd <= 0 && this.dataSignal().length > 0) {
        return this.dataSignal().length;
      }

      return calculatedEnd;
    }
    const total = this.filteredData().length || this.totalItemsSignal();
    const page = this.currentPageSignal();
    const size = this.pageSizeSignal();
    const currentPageEnd = page * size;
    return Math.min(currentPageEnd, total);
  });
  public paginatedData = computed(() => {
    // For server-side pagination, show all data passed (server already paginated it)
    if (this.serverSidePagination) {
      return this.filteredData().length > 0 ? this.filteredData() : this.dataSignal();
    }
    // For client-side pagination, slice the data
    const allData = this.filteredData().length > 0 ? this.filteredData() : this.dataSignal();
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return allData.slice(start, end);
  });

  ngOnInit(): void {
    this.dataSignal.set(this._dataInput);
    // Initialize signals from inputs
    this.totalItemsSignal.set(this.totalItems);
    this.pageSizeSignal.set(this.pageSize);
    this.currentPageSignal.set(this.currentPage);
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // First, apply pagination-related inputs so internal signals are correct
    if (changes['currentPage']) {
      // Update internal currentPage when input changes
      const newPage = changes['currentPage'].currentValue;
      if (newPage !== undefined && newPage !== null) {
        this.currentPage = newPage;
        this.currentPageSignal.set(newPage);
      }
    }

    if (changes['pageSize']) {
      // Update internal pageSize when input changes
      const newSize = changes['pageSize'].currentValue;
      if (newSize !== undefined && newSize !== null && newSize > 0) {
        this.pageSize = newSize;
        this.pageSizeSignal.set(newSize);
      }
    }

    if (changes['totalItems']) {
      // Ensure totalItems is set correctly and update signal
      const newTotal = changes['totalItems'].currentValue;
      if (newTotal !== undefined && newTotal !== null) {
        this.totalItems = newTotal;
        this.totalItemsSignal.set(newTotal);
      }
    }

    // Now update the data; do this after page/pageSize so computed values use the correct page
    if (changes['data']) {
      const val = changes['data'].currentValue;
      this.dataSignal.set(val || []);
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    let filtered = [...this.dataSignal()];

    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(row => {
        return Object.values(row).some(value =>
          value && value.toString().toLowerCase().includes(query)
        );
      });
    }

    this.filteredData.set(filtered);
    // Update totalItems based on filtered data if using client-side filtering and not server-side pagination
    if (!this.serverSidePagination && this.filteredData().length !== this.dataSignal().length) {
      this.totalItems = this.filteredData().length;
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.currentPageSignal.set(page);
    this.emitPageChange();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.emitPageChange();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    this.sortChange.emit({ column: this.sortColumn, order: this.sortOrder });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.applyFilters();
    this.searchChange.emit(query);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onExport(): void {
    this.export.emit();
  }

  onRowClick(row: TableData): void {
    if (this.selectable) {
      this.rowClick.emit(row);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.onPageChange(page);
    }
  }

  isPageNumber(page: number | string): page is number {
    return typeof page === 'number';
  }

  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page : 1;
  }

  public visiblePages = computed(() => {
    const current = this.currentPageSignal();
    const total = this.totalPages();

    // If still 0 or invalid, return empty array
    if (total <= 0) {
      return [];
    }

    return this.calculateVisiblePages(current, total);
  });

  private calculateVisiblePages(current: number, total: number): (number | string)[] {
    // If only 1 page, just return [1]
    if (total === 1) {
      return [1];
    }

    // If total pages is 4 or less, show all pages
    if (total <= 4) {
      const pages: number[] = [];
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // For more than 4 pages, show with ellipsis
    const pages: (number | string)[] = [];
    const delta = 1; // Show 1 page on each side of current

    // Always show first page
    pages.push(1);

    // Calculate start and end of middle range
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    // Adjust if we're near the beginning
    if (current <= 3) {
      start = 2;
      end = Math.min(4, total - 1);
    }

    // Adjust if we're near the end
    if (current >= total - 2) {
      start = Math.max(2, total - 3);
      end = total - 1;
    }

    // Add ellipsis before middle range if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add middle range pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis after middle range if needed
    if (end < total - 1) {
      pages.push('...');
    }

    // Always show last page (if not already included)
    if (total > 1 && !pages.includes(total)) {
      pages.push(total);
    }

    return pages;
  }


  getColumnClasses(column: TableColumn): string {
    const baseClasses = 'px-4 py-2 sm:px-6 sm:py-2 text-left text-xs font-bold text-primary-900 dark:text-primary-100 uppercase tracking-wider';
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return `${baseClasses} ${alignClasses[column.align as keyof typeof alignClasses] || alignClasses.left}`;
  }

  getCellClasses(column: TableColumn): string {
    const baseClasses = 'px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm text-on-surface whitespace-nowrap sm:whitespace-normal';
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return `${baseClasses} ${alignClasses[column.align as keyof typeof alignClasses] || alignClasses.left}`;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4';
    }

    return this.sortOrder === 'asc'
      ? 'M3 4h13M3 8h9m-9 4h6m4 0l3-3m0 0l3 3m-3-3v12'
      : 'M3 4h13M3 8h9m-9 4h6m4 0l3 3m0 0l3-3m-3 3v12';
  }

  onActionClick(event: Event, row: TableData): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    if (button) {
      const action = button.getAttribute('data-action');
      if (action) {
        this.actionClick.emit({ action, row });
      }
    }
  }

  getSafeHtml(column: TableColumn, row: TableData): SafeHtml {
    if (column.render) {
      const html = column.render(row[column.key], row);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    return this.sanitizer.bypassSecurityTrustHtml(String(row[column.key] || ''));
  }

  formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return '';
    }

    // If it's an object, try to convert it to a readable string
    if (typeof value === 'object' && !(value instanceof Date)) {
      // For arrays, try to join them
      if (Array.isArray(value)) {
        if (value.length === 0) return 'N/A';
        // If array contains objects with common properties, try to extract names
        if (value[0] && typeof value[0] === 'object') {
          const firstKey = Object.keys(value[0])[0];
          if (firstKey && (firstKey.includes('name') || firstKey.includes('user') || firstKey.includes('title'))) {
            return value.map((item: any) => item[firstKey] || JSON.stringify(item)).join(', ');
          }
          return value.map((item: any) => JSON.stringify(item)).join(', ');
        }
        return value.join(', ');
      }
      // For objects, return a formatted string
      return JSON.stringify(value);
    }

    // For dates, format them
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return String(value);
  }

  getColspan(): number {
    return this.showCheckbox ? this.columns.length + 1 : this.columns.length;
  }

  isRowSelected(row: TableData): boolean {
    const rowId = row['id'];
    return this.selectedRows().has(rowId);
  }

  onRowSelectChange(row: TableData, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const rowId = row['id'];

    this.selectedRows.update(selected => {
      const newSet = new Set(selected);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });

    this.emitSelectionChange();
  }

  isAllSelected(): boolean {
    const data = this.paginatedData();
    if (data.length === 0) return false;
    return data.every(row => {
      const rowId = row['id'];
      return this.selectedRows().has(rowId);
    });
  }

  isIndeterminate(): boolean {
    const data = this.paginatedData();
    if (data.length === 0) return false;
    const selectedCount = data.filter(row => {
      const rowId = row['id'];
      return this.selectedRows().has(rowId);
    }).length;
    return selectedCount > 0 && selectedCount < data.length;
  }

  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const data = this.paginatedData();

    this.selectedRows.update(selected => {
      const newSet = new Set(selected);
      data.forEach(row => {
        const rowId = row['id'];
        if (checked) {
          newSet.add(rowId);
        } else {
          newSet.delete(rowId);
        }
      });
      return newSet;
    });

    this.emitSelectionChange();
  }

  private emitSelectionChange(): void {
    const allData = this.dataSignal();
    const selected = Array.from(this.selectedRows())
      .map(id => allData.find(row => row['id'] === id))
      .filter(row => row !== undefined) as TableData[];
    this.selectionChange.emit(selected);
  }

  private emitPageChange(): void {
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: this.pageSize,
      sort: this.sortColumn,
      order: this.sortOrder,
      search: this.searchQuery
    });
  }

  getTopBarButtons(): DynamicButtonConfig[] {
    // If topBarButtons are provided, use them; otherwise, build from legacy flags
    if (this.topBarButtons && this.topBarButtons.length > 0) {
      return this.topBarButtons.map(btn => ({
        ...btn,
        disabled: btn.disabled || this.loading,
        loading: btn.loading || false
      }));
    }

    // Build buttons from legacy flags for backward compatibility
    const buttons: DynamicButtonConfig[] = [];

    if (this.showRefresh) {
      buttons.push({
        label: 'Refresh',
        action: 'refresh',
        variant: 'ghost',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        disabled: this.loading,
        tooltip: 'Refresh',
        size: 'md',
        showOnlyIcon: true
      });
    }

    if (this.showExport) {
      buttons.push({
        label: 'Export',
        action: 'export',
        variant: 'outline',
        icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        disabled: this.loading,
        tooltip: 'Export',
        size: 'md'
      });
    }

    return buttons;
  }

  onTopBarButtonClick(action: string): void {
    // Handle legacy actions for backward compatibility
    switch (action) {
      case 'refresh':
        this.onRefresh();
        break;
      case 'export':
        this.onExport();
        break;
      default:
        // Emit custom action
        this.topBarButtonClick.emit(action);
        break;
    }
  }
}

