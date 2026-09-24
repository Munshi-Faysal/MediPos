import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (totalItems > 0) {
      <div class="p-4 border-t border-border bg-surface-variant/5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <!-- Page Info -->
        <div class="text-xs sm:text-sm font-medium text-on-surface-variant">
          Showing <span class="font-bold text-on-surface">{{ startItem }}</span> to 
          <span class="font-bold text-on-surface">{{ endItem }}</span> of 
          <span class="font-bold text-on-surface">{{ totalItems }}</span> results
        </div>

        <!-- Controls -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Page Size Selector -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-on-surface-variant">Show:</span>
            <div class="relative inline-flex items-center">
              <select
                [ngModel]="selectedPageSizeOption"
                (ngModelChange)="onPageSizeChange($event)"
                class="appearance-none pl-3 pr-8 py-1.5 min-w-[70px] bg-surface border border-border rounded-xl text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-500/50 cursor-pointer shadow-sm transition-all">
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size">{{ size }}</option>
                }
              </select>
              <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Page Navigation -->
          <div class="flex items-center gap-1">
            <!-- First Page -->
            <button
              type="button"
              (click)="goToPage(1)"
              [disabled]="currentPage <= 1"
              class="p-2 rounded-xl border border-border text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="First Page">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>

            <!-- Previous Page -->
            <button
              type="button"
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage <= 1"
              class="p-2 rounded-xl border border-border text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Previous Page">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
              @for (page of visiblePages(); track $index) {
                @if (page === -1) {
                  <span class="px-2 text-xs font-black text-on-surface-variant/40">...</span>
                } @else {
                  <button
                    type="button"
                    (click)="goToPage(page)"
                    [class]="currentPage === page 
                      ? 'bg-primary-600 text-white font-black shadow-md shadow-primary-500/20' 
                      : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface font-bold border border-transparent hover:border-border'"
                    class="min-w-[34px] h-8 px-2 text-xs rounded-xl transition-all">
                    {{ page }}
                  </button>
                }
              }
            </div>

            <!-- Next Page -->
            <button
              type="button"
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage >= totalPages"
              class="p-2 rounded-xl border border-border text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Next Page">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <!-- Last Page -->
            <button
              type="button"
              (click)="goToPage(totalPages)"
              [disabled]="currentPage >= totalPages"
              class="p-2 rounded-xl border border-border text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Last Page">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() pageSize = 20;
  @Input() totalItems = 0;
  @Input() pageSizeOptions: (number | string)[] = [20, 50, 100, 'ALL'];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get selectedPageSizeOption(): number | string {
    if (this.pageSize >= 100000 || (this.totalItems > 0 && this.pageSize >= this.totalItems && this.pageSizeOptions.includes('ALL'))) {
      return 'ALL';
    }
    return this.pageSize;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  visiblePages = computed(() => {
    const current = this.currentPageSignal();
    const total = this.totalPagesSignal();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, -1, total);
    } else if (current >= total - 3) {
      pages.push(1, -1, total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, -1, current - 1, current, current + 1, -1, total);
    }
    return pages;
  });

  private currentPageSignal = signal(this.currentPage);
  private totalPagesSignal = signal(this.totalPages);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage']) {
      this.currentPageSignal.set(this.currentPage);
    }
    if (changes['totalItems'] || changes['pageSize']) {
      this.totalPagesSignal.set(this.totalPages);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(newSize: any): void {
    if (newSize === 'ALL') {
      const allSize = 1000000;
      this.pageSizeChange.emit(allSize);
    } else {
      const size = Number(newSize);
      if (size && size !== this.pageSize) {
        this.pageSizeChange.emit(size);
      }
    }
  }
}
