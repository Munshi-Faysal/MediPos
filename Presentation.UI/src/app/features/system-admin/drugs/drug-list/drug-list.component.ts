import { Component, signal, OnInit, inject, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugCompanyService } from '../../../../core/services/drug-company.service';
import { DrugGenericService } from '../../../../core/services/drug-generic.service';
import { DrugService, DrugViewModel } from '../../../../core/services/drug.service';
import { DrugTypeService } from '../../../../core/services/drug-type.service';
import { DrugStrengthService } from '../../../../core/services/drug-strength.service';
import { DrugCompany } from '../../../../core/models/drug-company.model';
import { DrugGeneric } from '../../../../core/models/drug-generic.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [FormsModule, PaginationComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Repository</h1>
          <p class="text-on-surface-variant">Master Data & Prescription Details</p>
        </div>
        @if (isSuperAdmin()) {
          <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
            Add New Drug
          </button>
        }
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by brand, generic, or company..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="w-full pl-10 pr-4 py-2 bg-surface-variant/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="w-full md:w-56">
            <select [(ngModel)]="selectedType" (change)="onTypeChange()" class="w-full px-3 py-2 bg-surface-variant/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-on-surface cursor-pointer">
              <option value="All">All Types</option>
              @for (type of drugTypes; track type) {
                <option [value]="type.name">{{ type.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    
      <!-- Data Table -->
      <div class="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-border">
                <th class="px-6 py-4">Brand Name</th>
                <th class="px-6 py-4">Generic Name</th>
                <th class="px-6 py-4">Company</th>
                <th class="px-6 py-4">Type / Strength</th>
                <th class="px-6 py-4">Status</th>
                @if (isSuperAdmin()) {
                  <th class="px-6 py-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @if (isLoading()) {
                <tr>
                  <td [attr.colspan]="isSuperAdmin() ? 6 : 5" class="px-6 py-12 text-center text-on-surface-variant">
                    <div class="flex items-center justify-center gap-3">
                      <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span class="font-medium text-sm">Loading medications...</span>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (drug of drugs(); track (drug.drugDetailId || drug.id)) {
                  <tr class="hover:bg-surface-variant/20 transition-colors">
                    <td class="px-6 py-4">
                      <span class="font-medium text-on-surface block">{{ drug.brandName }}</span>
                      @if (drug.sku) {
                        <span class="text-[11px] text-on-surface-variant/60 font-mono">#{{ drug.sku }}</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-on-surface-variant text-sm">{{ drug.genericName || 'N/A' }}</td>
                    <td class="px-6 py-4 text-on-surface-variant text-sm">{{ drug.company || 'N/A' }}</td>
                    <td class="px-6 py-4 text-sm">
                      @if (drug.type || drug.strength) {
                        <div class="flex items-center gap-1.5 flex-wrap">
                          @if (drug.type) {
                            <span class="px-2 py-0.5 rounded bg-surface-variant/60 text-on-surface text-xs font-semibold">{{ drug.type }}</span>
                          }
                          @if (drug.strength) {
                            <span class="text-on-surface-variant text-xs">{{ drug.strength }}</span>
                          }
                        </div>
                      } @else {
                        <span class="text-on-surface-variant">N/A</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="drug.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                        class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                        {{ drug.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    @if (isSuperAdmin()) {
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <!-- Edit Button -->
                          <button
                            (click)="editDrug(drug)"
                            class="p-2 rounded-lg text-primary-600 hover:bg-primary-500/10 hover:text-primary-700 transition-colors"
                            title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>

                          <!-- Activate / Deactivate Button -->
                          <button
                            (click)="toggleStatus(drug)"
                            [class]="drug.isActive ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'"
                            class="p-2 rounded-lg transition-colors"
                            [title]="drug.isActive ? 'Deactivate' : 'Activate'">
                            @if (drug.isActive) {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                              </svg>
                            } @else {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            }
                          </button>

                          <!-- Delete Button -->
                          <button
                            (click)="deleteDrug(drug)"
                            class="p-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    }
                  </tr>
                }
                @if (drugs().length === 0) {
                  <tr>
                    <td [attr.colspan]="isSuperAdmin() ? 6 : 5" class="px-6 py-10 text-center text-on-surface-variant">No records found.</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Dynamic Pagination -->
        <app-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="totalRecords()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)">
        </app-pagination>
      </div>
    
        <!-- Drug Form Modal: Master-Detail Design -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <!-- Modal Header -->
              <div class="px-6 py-5 border-b border-border bg-surface flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-bold text-on-surface">{{ editingDrug ? 'Edit' : 'Add New' }} Drug</h2>
                  <p class="text-sm text-on-surface-variant mt-0.5">Configure master data and default prescription details</p>
                </div>
                <button (click)="closeModal()" class="p-2 hover:bg-surface-variant rounded-lg transition-all text-on-surface-variant hover:text-on-surface">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <!-- Modal Body -->
              <div class="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                <!-- Master Data Section -->
                <section class="space-y-4">
                  <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary-600"></span>
                    Master Data Identification
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Brand Name</label>
                      <input type="text" [(ngModel)]="drugForm.brandName" placeholder="e.g. Napa Extend" class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all">
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Generic Name</label>
                      <select [(ngModel)]="drugForm.genericId" class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all">
                        <option [ngValue]="0" disabled>Select Generic</option>
                        @for (g of generics(); track g) {
                          <option [ngValue]="g.id">{{ g.name }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Company / Manufacturer</label>
                      <select [(ngModel)]="drugForm.drugCompanyId" class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all">
                        <option [ngValue]="0" disabled>Select Company</option>
                        @for (c of companies(); track c) {
                          <option [ngValue]="c.id">{{ c.name }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-on-surface-variant mb-1 block">SKU / Code</label>
                      <input type="text" [(ngModel)]="drugForm.sku" placeholder="DRG-001" class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all">
                    </div>
                  </div>
                </section>

                <!-- Detail Data Section -->
                <section class="space-y-4 pt-4 border-t border-border">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Prescription Details (Variations)
                    </h3>
                    <button (click)="addDetail()" class="px-3 py-1.5 bg-primary-600/10 text-primary-600 hover:bg-primary-600/20 rounded-lg text-xs font-semibold transition-all border border-primary-600/20">
                      + Add Variation
                    </button>
                  </div>

                  <div class="space-y-3">
                    @for (detail of drugForm.details; track detail; let i = $index) {
                      <div class="p-3 bg-surface-variant/20 border border-border rounded-xl flex flex-col md:flex-row gap-3 items-end">
                        <!-- Type -->
                        <div class="flex-1 w-full">
                          <label class="text-[11px] font-semibold text-on-surface-variant mb-1 block">Type (Form)</label>
                          <select [(ngModel)]="detail.drugTypeId" class="w-full px-3 py-1.5 bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-on-surface transition-all">
                            <option [ngValue]="0" disabled>Select Type</option>
                            @for (type of drugTypes; track type) {
                              <option [ngValue]="type.id">{{ type.name }}</option>
                            }
                          </select>
                        </div>
                        <!-- Strength -->
                        <div class="flex-1 w-full">
                          <label class="text-[11px] font-semibold text-on-surface-variant mb-1 block">Strength</label>
                          <select [(ngModel)]="detail.drugStrengthId" class="w-full px-3 py-1.5 bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-on-surface transition-all">
                            <option [ngValue]="0" disabled>Select Strength</option>
                            @for (s of drugStrengths; track s) {
                              <option [ngValue]="s.id">{{ s.name }}</option>
                            }
                          </select>
                        </div>
                        <!-- Unit Price -->
                        <div class="w-full md:w-32">
                          <label class="text-[11px] font-semibold text-on-surface-variant mb-1 block">Unit Price</label>
                          <div class="relative">
                            <span class="absolute left-2.5 top-1.5 text-on-surface-variant text-xs">৳</span>
                            <input type="number" [(ngModel)]="detail.unitPrice" placeholder="0.00" class="w-full pl-6 pr-2 py-1.5 bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-on-surface transition-all">
                          </div>
                        </div>
                        <!-- Description -->
                        <div class="flex-[2] w-full">
                          <label class="text-[11px] font-semibold text-on-surface-variant mb-1 block">Description / Note</label>
                          <input type="text" [(ngModel)]="detail.description" placeholder="e.g. 75 ml bottle" class="w-full px-3 py-1.5 bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-on-surface transition-all">
                        </div>
                        <!-- Remove -->
                        <button (click)="removeDetail(i)" class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all" title="Remove Variation">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    }
                    @if (drugForm.details.length === 0) {
                      <div class="p-6 text-center text-xs text-on-surface-variant border border-dashed border-border rounded-xl">
                        No variations added. Please add at least one Type + Strength combination.
                      </div>
                    }
                    @if (hasDuplicateDetails()) {
                      <div class="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-600 text-xs font-semibold animate-in fade-in">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Duplicate variation detected! Each combination of Type and Strength must be unique.
                      </div>
                    }
                  </div>
                </section>

                <!-- Active Toggle -->
                <div class="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl border border-border cursor-pointer select-none" (click)="drugForm.isActive = !drugForm.isActive">
                  <div class="relative w-10 h-5 rounded-full transition-colors duration-200" [class.bg-primary-600]="drugForm.isActive" [class.bg-surface-variant]="!drugForm.isActive">
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="drugForm.isActive"></div>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-on-surface">Mark as Active</p>
                    <p class="text-[11px] text-on-surface-variant">Enable this drug for prescriptions and sales</p>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="px-6 py-4 border-t border-border bg-surface flex justify-end gap-3">
                <button (click)="closeModal()" class="px-4 py-2 border border-border rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-variant transition-all">Cancel</button>
                <button
                  (click)="saveDrug()"
                  [disabled]="!isFormValid()"
                  class="px-5 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md"
                  >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  `]
})
export class DrugListComponent implements OnInit {
  private companyService = inject(DrugCompanyService);
  private genericService = inject(DrugGenericService);
  private drugService = inject(DrugService);
  private typeService = inject(DrugTypeService);
  private strengthService = inject(DrugStrengthService);
  private authService = inject(AuthService);

  public isSuperAdmin = computed(() => this.authService.isSuperAdmin());

  public drugs = signal<any[]>([]);
  public totalRecords = signal(0);
  public isLoading = signal(false);
  public currentPage = signal(1);
  public pageSize = signal(20);
  private searchDebounceTimer: any = null;

  public companies = signal<DrugCompany[]>([]);
  public generics = signal<DrugGeneric[]>([]);
  public isModalOpen = signal(false);
  public searchQuery = '';
  public selectedType = 'All';
  public editingDrug: any = null;
  public drugTypes: any[] = [];
  public drugStrengths: any[] = [];
  public drugForm = {
    brandName: '',
    genericId: 0,
    drugCompanyId: 0,
    sku: '',
    details: [] as { drugStrengthId: number, drugTypeId: number, description: string, unitPrice: number }[],
    isActive: true
  };

  ngOnInit(): void {
    // Load companies
    this.companyService.getActiveCompanies().subscribe({
      next: (data) => {
        this.companies.set(data.map((c: any) => ({
          ...c,
          id: Number(c.id || 0)
        })));
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });

    // Load generics
    this.genericService.getActiveGenerics().subscribe({
      next: (data) => {
        this.generics.set(data.map((g: any) => ({
          ...g,
          id: Number(g.id || 0)
        })));
      },
      error: (err) => {
        console.error('Error loading generics:', err);
      }
    });

    // Load drug types
    this.typeService.getDrugTypes({ page: 1, pageSize: 500 } as any).subscribe({
      next: (response) => {
        const data = (response as any)?.data?.itemList || (response as any)?.data || [];
        this.drugTypes = data.map((t: any) => ({
          id: Number(t.id || 0),
          name: t.name
        }));
      },
      error: (err) => console.error('Error loading drug types:', err)
    });

    // Load drug strengths (load up to 2000 so all 1,037 are available in dropdown)
    this.strengthService.getDrugStrengths({ page: 1, pageSize: 2000 }).subscribe({
      next: (response) => {
        const data = (response as any)?.data || [];
        // Map to "Quantity Unit" string format but keep object structure
        this.drugStrengths = data
          .filter((s: any) => s.isActive)
          .map((s: any) => ({
            id: Number(s.id || 0),
            name: s.unitName ? `${s.quantity} ${s.unitName}` : s.quantity
          }));
      },
      error: (err) => console.error('Error loading drug strengths:', err)
    });

    // Load drugs
    this.loadDrugs();
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
        const mapped = data.map((drug: any) => ({
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
          isActive: drug.isActive
        }));
        this.drugs.set(mapped);
        this.totalRecords.set(response.totalCount || mapped.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading drugs:', err);
        this.drugs.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
      }
    });
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadDrugs();
    }, 300);
  }

  onTypeChange(): void {
    this.currentPage.set(1);
    this.loadDrugs();
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

  openModal(): void {
    if (!this.isSuperAdmin()) return;
    this.editingDrug = null;
    this.drugForm = {
      brandName: '',
      genericId: 0,
      drugCompanyId: 0,
      sku: '',
      details: [{ drugStrengthId: 0, drugTypeId: 0, description: '', unitPrice: 0 }], // Start with one empty row
      isActive: true
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editDrug(drug: any): void {
    if (!this.isSuperAdmin()) return;
    this.editingDrug = drug;
    // Fetch full data with specific IDs and all variations for editing
    this.drugService.getWithDetails(drug.encryptedId).subscribe({
      next: (dto) => {
        this.drugForm = {
          brandName: dto.name,
          genericId: Number(dto.genericId || 0),
          drugCompanyId: Number(dto.drugCompanyId || 0),
          sku: dto.code || '',
          details: dto.drugDetails?.map((d: any) => ({
            id: d.id || 0,
            drugStrengthId: Number(d.drugStrengthId || 0),
            drugTypeId: Number(d.drugTypeId || 0),
            unitPrice: d.unitPrice || 0,
            description: d.description || ''
          })) || [{ drugStrengthId: 0, drugTypeId: 0, description: '', unitPrice: 0 }],
          isActive: dto.isActive !== false
        };
        this.isModalOpen.set(true);
      },
      error: (err) => {
        console.error('Error fetching drug details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load drug details for editing.'
        });
      }
    });
  }

  addDetail(): void {
    this.drugForm.details.push({ drugStrengthId: 0, drugTypeId: 0, description: '', unitPrice: 0 });
  }

  removeDetail(index: number): void {
    this.drugForm.details.splice(index, 1);
  }

  hasDuplicateDetails(): boolean {
    const details = this.drugForm.details;
    if (details.length === 0) return false;

    const seen = new Set();
    for (const d of details) {
      if (!d.drugStrengthId || !d.drugTypeId) continue;
      // Duplicates based on Type + Strength combination
      const key = `${d.drugTypeId}|${d.drugStrengthId}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  }

  areDetailsValid(): boolean {
    return this.drugForm.details.length > 0 &&
      this.drugForm.details.every(d => Number(d.drugStrengthId) > 0 && Number(d.drugTypeId) > 0);
  }

  isFormValid(): boolean {
    const hasBrand = !!this.drugForm.brandName && this.drugForm.brandName.trim().length > 0;
    const hasGeneric = Number(this.drugForm.genericId) > 0;
    const hasCompany = Number(this.drugForm.drugCompanyId) > 0;
    const detailsValid = this.areDetailsValid();
    const noDuplicates = !this.hasDuplicateDetails();

    // Log the validation status for debugging
    if (!hasBrand || !hasGeneric || !hasCompany || !detailsValid || !noDuplicates) {
      console.warn('Form Validation Status:', {
        hasBrand,
        hasGeneric, genericId: this.drugForm.genericId,
        hasCompany, companyId: this.drugForm.drugCompanyId,
        detailsValid,
        noDuplicates,
        form: this.drugForm
      });
    }

    return hasBrand && hasGeneric && hasCompany && detailsValid && noDuplicates;
  }

  saveDrug(): void {
    if (!this.isSuperAdmin()) return;

    const dto: any = {
      encryptedId: this.editingDrug?.encryptedId,
      name: this.drugForm.brandName,
      code: this.drugForm.sku,
      isActive: this.drugForm.isActive,
      drugCompanyId: Number(this.drugForm.drugCompanyId),
      genericId: Number(this.drugForm.genericId),
      drugDetails: this.drugForm.details.map(d => ({
        drugStrengthId: Number(d.drugStrengthId),
        drugTypeId: Number(d.drugTypeId),
        description: d.description,
        unitPrice: d.unitPrice,
        isActive: true
      }))
    };

    if (this.editingDrug) {
      this.drugService.updateDrug(dto).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            text: 'Drug updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadDrugs();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating drug:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update drug. Please try again.'
          });
        }
      });
    } else {
      this.drugService.createDrug(dto).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Created',
            text: 'Drug created successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadDrugs();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating drug:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create drug. Please try again.'
          });
        }
      });
    }
  }

  alertInvalidFields(): void {
    const brand = this.drugForm.brandName ? String(this.drugForm.brandName).trim() : '';
    const reasons = [];

    if (!brand) reasons.push('Brand Name (required)');
    if (Number(this.drugForm.genericId) <= 0) reasons.push('Generic Name (required)');
    if (Number(this.drugForm.drugCompanyId) <= 0) reasons.push('Company / Manufacturer (required)');
    if (!this.areDetailsValid()) reasons.push('One or more variations are incomplete (Type and Strength must be selected)');
    if (this.hasDuplicateDetails()) reasons.push('Duplicate variations detected (Type + Strength must be unique)');

    if (reasons.length > 0) {
      console.warn('Form Validation Errors:', {
        form: this.drugForm,
        status: { brand, generic: this.drugForm.genericId, company: this.drugForm.drugCompanyId, detailsValid: this.areDetailsValid() }
      });
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        html: 'Please correct the following fields before saving:<br><br><div class="text-left font-sans text-sm">• ' + reasons.join('<br>• ') + '</div>'
      });
    }
  }

  toggleStatus(drug: any): void {
    if (!this.isSuperAdmin()) return;
    if (drug.encryptedId) {
      this.drugService.changeDrugActiveStatus(drug.encryptedId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Status Updated',
            text: `Drug is now ${drug.isActive ? 'Inactive' : 'Active'}.`,
            timer: 1500,
            showConfirmButton: false
          });
          this.loadDrugs();
        },
        error: (err) => {
          console.error('Error toggling drug status:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to change status. Please try again.'
          });
        }
      });
    }
  }

  deleteDrug(drug: any): void {
    if (!this.isSuperAdmin()) return;
    Swal.fire({
      title: 'Delete Drug?',
      text: `Are you sure you want to delete "${drug.brandName}"? All its variations will also be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.drugService.deleteDrug(drug.encryptedId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Drug deleted successfully.',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadDrugs();
          },
          error: (err) => {
            console.error('Error deleting drug:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete drug. Please try again.'
            });
          }
        });
      }
    });
  }
}
