import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrugService, DrugMonographDto } from '../../../../core/services/drug.service';
import { DrugTypeService } from '../../../../core/services/drug-type.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

export interface QuickDrugItem {
  id: number | string;
  encryptedId?: string;
  drugDetailId?: number;
  brandName: string;
  genericName: string;
  company: string;
  sku: string;
  type: string;
  strength: string;
  unitPrice: number;
  isActive: boolean;
  url?: string;
}

@Component({
  selector: 'app-drug-quick-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- MedEx Style Top Search Bar -->
      <div class="bg-surface border border-border rounded-2xl p-4 shadow-soft sticky top-4 z-20 backdrop-blur-md bg-surface/95">
        <div class="flex items-center gap-3">
          <!-- Filter Indicator Tag -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm shrink-0">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filter
          </div>

          <!-- Search Input Box -->
          <div class="relative flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (keydown.enter)="onSearchEnter()"
              placeholder="Search by brand or generic name (e.g. Napgin, Napa, Naproxen, Paracetamol)..."
              class="w-full pl-11 pr-10 py-3 bg-surface-variant/40 hover:bg-surface-variant/60 focus:bg-surface border-2 border-border focus:border-emerald-600 rounded-xl outline-none font-medium text-base text-on-surface placeholder:text-on-surface-variant/60 transition-all shadow-inner"
            />
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
              @if (isLoading()) {
                <div class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              }
            </div>

            @if (searchQuery) {
              <button
                (click)="clearSearch()"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant/60 hover:text-on-surface transition-colors"
                title="Clear search">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            }
          </div>

          <!-- Search Action Button -->
          <button
            (click)="onSearchEnter()"
            class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span class="hidden md:inline">Search</span>
          </button>
        </div>

        <!-- Quick Pills & Controls -->
        <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-border/50 text-xs">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-on-surface-variant font-semibold mr-1">Quick Select:</span>
            @for (tag of popularTags; track tag) {
              <button
                type="button"
                (click)="applySuggestion(tag)"
                [class.bg-emerald-600]="searchQuery.toLowerCase() === tag.toLowerCase()"
                [class.text-white]="searchQuery.toLowerCase() === tag.toLowerCase()"
                class="px-2.5 py-1 rounded-lg bg-surface-variant/50 hover:bg-emerald-600/10 hover:text-emerald-700 border border-border text-[11px] font-medium transition-all">
                {{ tag }}
              </button>
            }
          </div>

          <!-- Active View Badge / Toggle -->
          @if (selectedMonograph()) {
            <button
              (click)="closeMonograph()"
              class="px-3 py-1 bg-surface-variant text-on-surface hover:bg-primary-600/10 hover:text-primary-600 rounded-lg text-xs font-bold transition-all border border-border flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Results ({{ totalRecords() }})
            </button>
          }
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- VIEW 1: FULL MONOGRAPH CLINICAL VIEW (MATCHING USER SCREENSHOT)     -->
      <!-- =================================================================== -->
      @if (selectedMonograph()) {
        @let mono = selectedMonograph()!;
        <div class="bg-surface border border-border rounded-2xl shadow-soft p-6 sm:p-8 space-y-6 animate-fadeIn">
          
          <!-- Top Breadcrumb / Return button -->
          <div class="flex items-center justify-between">
            <button
              (click)="closeMonograph()"
              class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Search Results
            </button>

            @if (mono.medExUrl) {
              <a [href]="mono.medExUrl" target="_blank" rel="noopener noreferrer" class="text-xs text-on-surface-variant hover:text-emerald-700 flex items-center gap-1 font-semibold">
                MedEx Source
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            }
          </div>

          <!-- Medicine Header Section (Exact MedEx Screenshot Header) -->
          <div class="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-border">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  {{ mono.brandName }}
                </h2>
                @if (mono.dosageForm) {
                  <span class="text-lg sm:text-xl font-medium text-on-surface-variant">
                    {{ mono.dosageForm }}
                  </span>
                }
                @if (mono.packImageUrl) {
                  <a [href]="mono.packImageUrl" target="_blank" class="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-emerald-700">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Pack Image
                  </a>
                }
              </div>

              <!-- Generic Name -->
              <p class="text-base font-semibold text-emerald-700">
                {{ mono.genericName || 'Generic Not Specified' }}
              </p>

              <!-- Strength -->
              @if (mono.strength) {
                <p class="text-sm font-medium text-on-surface-variant">
                  {{ mono.strength }}
                </p>
              }

              <!-- Manufacturer / Company -->
              <p class="text-sm font-semibold text-on-surface">
                {{ mono.manufacturer || 'Pharmaceutical Manufacturer' }}
              </p>

              <!-- Pricing Information -->
              <div class="pt-2 text-sm space-y-0.5">
                @if (mono.unitPrice && mono.unitPrice > 0) {
                  <p class="font-semibold text-on-surface">
                    Unit Price: <span class="font-bold text-emerald-700">৳ {{ mono.unitPrice | number:'1.2-2' }}</span>
                  </p>
                }
                @if (mono.stripPrice && mono.stripPrice > 0) {
                  <p class="text-xs text-on-surface-variant">
                    Strip Price: <span class="font-bold text-on-surface">৳ {{ mono.stripPrice | number:'1.2-2' }}</span>
                  </p>
                }
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 pt-3 flex-wrap">
                @if (mono.genericName) {
                  <button
                    (click)="searchAlternateBrands(mono.genericName)"
                    class="px-3.5 py-1.5 rounded-lg border-2 border-slate-700 text-slate-800 hover:bg-slate-800 hover:text-white text-xs font-bold transition-all shadow-sm">
                    Alternate Brands
                  </button>
                }
              </div>
            </div>

            <!-- Pack Image Thumbnail preview if available -->
            @if (mono.packImageUrl) {
              <div class="w-full sm:w-auto flex justify-center shrink-0">
                <a [href]="mono.packImageUrl" target="_blank" class="block border border-border rounded-xl p-2 bg-surface hover:shadow-md transition-all">
                  <img [src]="mono.packImageUrl" alt="Pack Image" class="max-h-28 object-contain rounded-lg" />
                </a>
              </div>
            }
          </div>

          <!-- Doctor advice alert banner -->
          <div class="text-right text-xs text-on-surface-variant italic">
            * রেজিস্টার্ড চিকিৎসকের পরামর্শ মোতাবেক ঔষধ সেবন করুন
          </div>

          <!-- ========================================================= -->
          <!-- 10 CLINICAL MONOGRAPH SECTIONS (GREY HEADERS PER SCREENSHOT) -->
          <!-- ========================================================= -->
          <div class="space-y-5">

            <!-- 1. Indications -->
            @if (mono.indications) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Indications</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.indications"></div>
              </div>
            }

            <!-- 2. Pharmacology -->
            @if (mono.pharmacology) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Pharmacology</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.pharmacology"></div>
              </div>
            }

            <!-- 3. Dosage & Administration -->
            @if (mono.dosageAdministration) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Dosage & Administration</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.dosageAdministration"></div>
              </div>
            }

            <!-- 4. Interaction -->
            @if (mono.interaction) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Interaction</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.interaction"></div>
              </div>
            }

            <!-- 5. Contraindications -->
            @if (mono.contraindications) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Contraindications</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.contraindications"></div>
              </div>
            }

            <!-- 6. Side Effects -->
            @if (mono.sideEffects) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Side Effects</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.sideEffects"></div>
              </div>
            }

            <!-- 7. Pregnancy & Lactation -->
            @if (mono.pregnancyLactation) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Pregnancy & Lactation</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.pregnancyLactation"></div>
              </div>
            }

            <!-- 8. Precautions & Warnings -->
            @if (mono.precautionsWarnings) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Precautions & Warnings</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.precautionsWarnings"></div>
              </div>
            }

            <!-- 9. Therapeutic Class -->
            @if (mono.therapeuticClass) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Therapeutic Class</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.therapeuticClass"></div>
              </div>
            }

            <!-- 10. Storage Conditions -->
            @if (mono.storageConditions) {
              <div class="overflow-hidden rounded-xl border border-border shadow-xs">
                <div class="bg-slate-200/90 dark:bg-slate-800 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Storage Conditions</h3>
                </div>
                <div class="p-4 bg-surface text-sm text-on-surface leading-relaxed monograph-body" [innerHTML]="mono.storageConditions"></div>
              </div>
            }

          </div>

          <!-- Bottom Return Button -->
          <div class="pt-6 border-t border-border flex justify-center">
            <button
              (click)="closeMonograph()"
              class="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Search Results
            </button>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- VIEW 2: SEARCH RESULTS LIST / GRID                                   -->
      <!-- =================================================================== -->
      @if (!selectedMonograph()) {
        <!-- Search Status / Count -->
        <div class="flex items-center justify-between text-xs text-on-surface-variant font-medium px-1">
          <div>
            @if (searchQuery.trim()) {
              Showing results for "<span class="font-bold text-on-surface">{{ searchQuery }}</span>"
            } @else {
              Displaying all medications
            }
          </div>
          <div>Total: <span class="font-bold text-emerald-600">{{ totalRecords() }}</span></div>
        </div>

        @if (isLoading()) {
          <div class="bg-surface border border-border rounded-2xl p-16 text-center shadow-soft">
            <div class="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="font-bold text-on-surface">Searching MedEx Repository...</p>
            <p class="text-xs text-on-surface-variant mt-1">Filtering through brands, generics, and clinical monographs</p>
          </div>
        } @else if (drugs().length === 0) {
          <div class="bg-surface border border-border rounded-2xl p-16 text-center shadow-soft space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-surface-variant/60 flex items-center justify-center text-on-surface-variant mx-auto">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-base font-bold text-on-surface">No medications found</h3>
            <p class="text-xs text-on-surface-variant max-w-sm mx-auto">
              No medicine matches "<span class="font-semibold text-on-surface">{{ searchQuery }}</span>". Try searching with another brand name or generic keyword.
            </p>
          </div>
        } @else {
          <!-- Drug Cards Grid with "View Monograph" Action -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (drug of drugs(); track (drug.drugDetailId || drug.id)) {
              <div class="bg-surface border border-border hover:border-emerald-600/50 rounded-2xl p-5 shadow-soft hover:shadow-md transition-all flex flex-col justify-between group">
                <div class="space-y-3">
                  <!-- Brand Name & SKU -->
                  <div class="flex justify-between items-start gap-2">
                    <div>
                      <h3 class="font-extrabold text-lg text-on-surface group-hover:text-emerald-700 transition-colors">
                        {{ drug.brandName }}
                      </h3>
                      @if (drug.sku) {
                        <span class="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-variant/70 text-on-surface-variant">
                          #{{ drug.sku }}
                        </span>
                      }
                    </div>

                    @if (drug.unitPrice > 0) {
                      <div class="text-right">
                        <span class="text-sm font-bold text-emerald-700">৳ {{ drug.unitPrice | number:'1.2-2' }}</span>
                        <span class="block text-[10px] text-on-surface-variant">Unit Price</span>
                      </div>
                    }
                  </div>

                  <!-- Generic Name Block -->
                  <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-600/15">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Generic</span>
                    <span class="text-xs font-bold text-on-surface block mt-0.5">{{ drug.genericName || 'N/A' }}</span>
                  </div>

                  <!-- Type & Strength Tags -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    @if (drug.type) {
                      <span class="px-2.5 py-1 rounded-lg bg-surface-variant/60 text-on-surface text-xs font-semibold">
                        {{ drug.type }}
                      </span>
                    }
                    @if (drug.strength && drug.strength !== 'N/A') {
                      <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-xs font-semibold border border-amber-500/20">
                        {{ drug.strength }}
                      </span>
                    }
                  </div>

                  <!-- Manufacturer -->
                  <div class="text-xs text-on-surface-variant flex items-center gap-1.5 pt-1">
                    <svg class="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span class="truncate font-medium">{{ drug.company || 'N/A' }}</span>
                  </div>
                </div>

                <!-- Footer: View Monograph Action -->
                <div class="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
                  <button
                    (click)="openMonograph(drug)"
                    class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    View Monograph Details
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          <div class="bg-surface border border-border rounded-2xl overflow-hidden shadow-soft mt-6">
            <app-pagination
              [currentPage]="currentPage()"
              [totalItems]="totalRecords()"
              [pageSize]="pageSize()"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)">
            </app-pagination>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .monograph-body ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .monograph-body li { margin-bottom: 0.25rem; }
    .monograph-body strong { font-weight: 700; color: #1e293b; }
    .monograph-body br { margin-bottom: 0.25rem; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
  `]
})
export class DrugQuickFilterComponent implements OnInit {
  private drugService = inject(DrugService);
  private typeService = inject(DrugTypeService);

  public drugs = signal<QuickDrugItem[]>([]);
  public totalRecords = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(24);

  public searchQuery = '';
  public selectedType = 'All';
  public drugTypes: { id: number; name: string }[] = [];
  public selectedMonograph = signal<DrugMonographDto | null>(null);

  private searchDebounceTimer: any = null;

  public popularTags = [
    'Napgin',
    'Naproxen',
    'Napa',
    'Paracetamol',
    'Seclo',
    'Omeprazole',
    'Ciprofloxacin',
    'Azithromycin',
    'Esomeprazole',
    'Metformin',
    'Montelukast',
    'Fexofenadine'
  ];

  ngOnInit(): void {
    this.loadDrugTypes();
    this.loadDrugs();
  }

  loadDrugTypes(): void {
    this.typeService.getDrugTypes({ page: 1, pageSize: 500 } as any).subscribe({
      next: (response) => {
        const data = (response as any)?.data?.itemList || (response as any)?.data || [];
        this.drugTypes = data.map((t: any) => ({
          id: Number(t.id || 0),
          name: t.name
        }));
      },
      error: (err) => console.error('Error loading dosage forms:', err)
    });
  }

  loadDrugs(): void {
    this.isLoading.set(true);
    this.drugService.getDrugs({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery.trim(),
      type: this.selectedType
    } as any).subscribe({
      next: (response: any) => {
        const data = response?.data || [];
        const mapped: QuickDrugItem[] = data.map((drug: any) => ({
          id: drug.encryptedId || drug.id,
          encryptedId: drug.encryptedId || String(drug.id),
          drugDetailId: drug.drugDetailId,
          brandName: drug.name,
          genericName: drug.drugGenericName || 'N/A',
          company: drug.drugCompanyName || 'N/A',
          sku: drug.code || '',
          type: drug.drugTypeName || '',
          strength: drug.drugStrengthName || '',
          unitPrice: drug.unitPrice || 0,
          isActive: drug.isActive,
          url: drug.description || ''
        }));
        this.drugs.set(mapped);
        this.totalRecords.set(response?.totalCount || mapped.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error searching drugs:', err);
        this.drugs.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
      }
    });
  }

  onSearchInput(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.selectedMonograph.set(null);
      this.loadDrugs();
    }, 280);
  }

  onSearchEnter(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.currentPage.set(1);
    this.selectedMonograph.set(null);
    this.loadDrugs();

    // If query matches a single brand or is specific, also try fetching monograph
    if (this.searchQuery.trim().length >= 3) {
      this.drugService.getMonograph({ brandName: this.searchQuery.trim() }).subscribe({
        next: (mono) => {
          if (mono && (mono.indications || mono.dosageAdministration || mono.pharmacology)) {
            this.selectedMonograph.set(mono);
          }
        }
      });
    }
  }

  openMonograph(drug: QuickDrugItem): void {
    this.isLoading.set(true);
    this.drugService.getMonograph({
      brandName: drug.brandName,
      genericName: drug.genericName !== 'N/A' ? drug.genericName : undefined,
      url: drug.url && drug.url.startsWith('http') ? drug.url : undefined
    }).subscribe({
      next: (mono) => {
        this.isLoading.set(false);
        if (mono) {
          // Populate missing fields if not present
          if (!mono.dosageForm && drug.type) mono.dosageForm = drug.type;
          if (!mono.strength && drug.strength) mono.strength = drug.strength;
          if (!mono.manufacturer && drug.company) mono.manufacturer = drug.company;
          if (!mono.unitPrice && drug.unitPrice) mono.unitPrice = drug.unitPrice;
          this.selectedMonograph.set(mono);
        } else {
          // Fallback monograph with available details
          this.selectedMonograph.set({
            brandName: drug.brandName,
            genericName: drug.genericName,
            dosageForm: drug.type,
            strength: drug.strength,
            manufacturer: drug.company,
            unitPrice: drug.unitPrice,
            indications: 'Clinical indications not available for this brand.',
            pharmacology: 'Clinical monograph pharmacology not indexed.',
            dosageAdministration: 'Follow doctor prescription advice.',
            storageConditions: 'Store in a cool and dry place away from sunlight.'
          });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.isLoading.set(false);
        this.selectedMonograph.set({
          brandName: drug.brandName,
          genericName: drug.genericName,
          dosageForm: drug.type,
          strength: drug.strength,
          manufacturer: drug.company,
          unitPrice: drug.unitPrice
        });
      }
    });
  }

  closeMonograph(): void {
    this.selectedMonograph.set(null);
  }

  searchAlternateBrands(genericName: string): void {
    this.selectedMonograph.set(null);
    this.searchQuery = genericName;
    this.currentPage.set(1);
    this.loadDrugs();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedMonograph.set(null);
    this.currentPage.set(1);
    this.loadDrugs();
  }

  applySuggestion(tag: string): void {
    this.searchQuery = tag;
    this.currentPage.set(1);
    this.selectedMonograph.set(null);
    this.loadDrugs();

    // Check if it's a specific brand with a monograph
    this.drugService.getMonograph({ brandName: tag }).subscribe({
      next: (mono) => {
        if (mono && (mono.indications || mono.dosageAdministration)) {
          this.selectedMonograph.set(mono);
        }
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadDrugs();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadDrugs();
  }
}
