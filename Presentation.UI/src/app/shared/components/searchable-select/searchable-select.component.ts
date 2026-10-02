import { Component, Input, Output, EventEmitter, ElementRef, HostListener, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableSelectItem {
  id?: number | string;
  name: string;
  count?: number;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full text-left" #container>
      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleOpen()"
        [disabled]="disabled"
        [class]="buttonClasses"
        [title]="selectedLabel"
        class="w-full flex items-center justify-between gap-1.5 px-3 py-2.5 bg-surface-variant/40 hover:bg-surface-variant/60 focus:bg-surface border-2 border-border focus:border-emerald-600 rounded-xl outline-none text-xs font-bold text-on-surface cursor-pointer transition-all shadow-inner select-none disabled:opacity-50 disabled:cursor-not-allowed">
        <span class="truncate block text-left flex-1" [class.text-emerald-700]="value !== 'All'">
          {{ selectedLabel }}
        </span>

        <div class="flex items-center gap-1 shrink-0 text-on-surface-variant/70">
          @if (value !== 'All' && !disabled) {
            <span
              role="button"
              (click)="clearSelection($event)"
              class="p-0.5 rounded hover:bg-surface-variant text-on-surface-variant/80 hover:text-on-surface transition-colors"
              title="Clear selection">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </span>
          }
          <svg
            class="w-3.5 h-3.5 transition-transform duration-200"
            [class.rotate-180]="isOpen()"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Dropdown Popup Panel -->
      @if (isOpen()) {
        <div
          class="absolute left-0 top-full mt-1.5 z-50 min-w-[200px] w-full sm:w-60 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          
          <!-- Sticky Search Input Box -->
          <div class="p-2 border-b border-border bg-surface sticky top-0 z-10">
            <div class="relative">
              <input
                #searchInput
                type="text"
                [(ngModel)]="filterQuery"
                (click)="$event.stopPropagation()"
                (keydown.escape)="close()"
                [placeholder]="searchPlaceholder"
                class="w-full pl-8 pr-7 py-1.5 bg-surface-variant/40 border border-border focus:border-emerald-600 rounded-lg outline-none text-xs font-medium text-on-surface placeholder:text-on-surface-variant/60 transition-all shadow-inner"
              />
              <svg class="w-3.5 h-3.5 absolute left-2.5 top-2 text-on-surface-variant/70 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              @if (filterQuery) {
                <button
                  type="button"
                  (click)="filterQuery = ''; searchInput.focus(); $event.stopPropagation()"
                  class="absolute right-2 top-2 text-on-surface-variant/60 hover:text-on-surface">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Items List -->
          <div class="max-h-60 overflow-y-auto p-1 divide-y divide-border/20 text-xs custom-scrollbar">
            <!-- "All" Reset Option -->
            <button
              type="button"
              (click)="selectItem('All')"
              [class.bg-emerald-50]="value === 'All'"
              [class.text-emerald-700]="value === 'All'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-variant/60 font-semibold flex items-center justify-between transition-colors">
              <span class="truncate">{{ allLabel }}</span>
              @if (value === 'All') {
                <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              }
            </button>

            <!-- Filtered Options -->
            @for (item of filteredItems(); track (item.id || item.name)) {
              <button
                type="button"
                (click)="selectItem(item.name)"
                [class.bg-emerald-50]="value === item.name"
                [class.text-emerald-700]="value === item.name"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-variant/60 font-medium flex items-center justify-between transition-colors group">
                <span class="truncate flex-1" [title]="item.name">{{ item.name }}</span>
                @if (item.count !== undefined) {
                  <span class="text-[10px] text-on-surface-variant/60 px-1.5 py-0.5 rounded bg-surface-variant shrink-0 ml-1">
                    {{ item.count }}
                  </span>
                }
                @if (value === item.name) {
                  <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                }
              </button>
            }

            <!-- Empty Filter State -->
            @if (filteredItems().length === 0) {
              <div class="px-3 py-4 text-center text-on-surface-variant/70 text-xs">
                No matching results
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.15s ease-out forwards; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 4px; }
  `]
})
export class SearchableSelectComponent {
  @Input() items: { id?: number | string; name: string; count?: number }[] = [];
  @Input() value: string = 'All';
  @Input() placeholder: string = 'Select...';
  @Input() allLabel: string = 'All';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() disabled: boolean = false;
  @Input() buttonClasses: string = '';

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('container') containerRef!: ElementRef;

  public isOpen = signal<boolean>(false);
  public filterQuery = '';

  public filteredItems = computed(() => {
    const q = this.filterQuery.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(item => item.name.toLowerCase().includes(q));
  });

  get selectedLabel(): string {
    if (!this.value || this.value === 'All') {
      return this.allLabel;
    }
    const found = this.items.find(i => i.name === this.value);
    return found ? found.name : this.value;
  }

  toggleOpen(): void {
    if (this.disabled) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.filterQuery = '';
      setTimeout(() => this.searchInputElement?.nativeElement?.focus(), 50);
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.filterQuery = '';
  }

  selectItem(name: string): void {
    this.value = name;
    this.valueChange.emit(name);
    this.close();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectItem('All');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (this.containerRef && !this.containerRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}
