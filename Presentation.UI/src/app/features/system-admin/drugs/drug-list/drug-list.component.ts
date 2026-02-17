import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugCompanyService } from '../../../../core/services/drug-company.service';
import { DrugGenericService } from '../../../../core/services/drug-generic.service';
import { DrugService, DrugViewModel } from '../../../../core/services/drug.service';
import { DrugTypeService } from '../../../../core/services/drug-type.service';
import { DrugStrengthService } from '../../../../core/services/drug-strength.service';
import { DrugCompany } from '../../../../core/models/drug-company.model';
import { DrugGeneric } from '../../../../core/models/drug-generic.model';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-black text-on-surface tracking-tight">Drug Repository</h1>
          <p class="text-on-surface-variant font-medium">Master Data & Prescription Details</p>
        </div>
        <button (click)="openModal()" class="px-6 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 transition-all shadow-xl hover:shadow-primary-500/30 active:scale-95 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Drug
        </button>
      </div>
    
      <!-- Search and Filters -->
      <div class="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1 group">
            <input
              type="text"
              placeholder="Search by brand, generic name or company..."
              [(ngModel)]="searchQuery"
              (input)="filterDrugs()"
              class="w-full pl-12 pr-4 py-4 bg-surface-variant/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium"
              >
              <svg class="w-6 h-6 absolute left-4 top-4 text-on-surface-variant/40 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div class="w-full md:w-56">
              <select [(ngModel)]="selectedType" (change)="filterDrugs()" class="w-full px-4 py-4 bg-surface-variant/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-on-surface-variant cursor-pointer appearance-none">
                <option value="All">All Types</option>
                @for (type of drugTypes; track type) {
                  <option [value]="type.name">{{ type.name }}</option>
                }
              </select>
            </div>
          </div>
        </div>
    
        <!-- Drugs Table -->
        <div class="bg-surface border border-border rounded-3xl overflow-hidden shadow-soft">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-variant/10 text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant/60 border-b border-border">
                  <th class="px-8 py-6">Master Drug Information</th>
                  <th class="px-8 py-6">Default Prescription</th>
                  <th class="px-8 py-6">Status</th>
                  <th class="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/50 text-sm">
                @for (drug of filteredDrugs(); track drug) {
                  <tr class="hover:bg-surface-variant/5 transition-colors group">
                    <td class="px-8 py-6">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                          {{ drug.brandName.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-black text-on-surface text-base leading-tight">{{ drug.brandName }}</p>
                          <p class="text-[11px] text-on-surface-variant/50 font-bold uppercase tracking-wider mt-1">{{ drug.genericName }}</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-[10px] bg-surface-variant/40 px-2 py-0.5 rounded-md font-bold text-on-surface-variant/70">{{ drug.company }}</span>
                            <span class="text-[10px] text-on-surface-variant/40 font-bold">#{{ drug.sku }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 text-[10px] font-black uppercase">{{ drug.type }}</span>
                          <span class="text-on-surface font-bold">{{ drug.strength }}</span>
                        </div>
                        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant/60 font-medium">
                          <span class="flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-primary-400"></span> {{ drug.dose }}</span>
                          <span class="flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-primary-400"></span> {{ drug.duration }}</span>
                          @if (drug.advice) {
                            <span class="flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-primary-400"></span> {{ drug.advice }}</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <span [class]="drug.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                        class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block">
                        {{ drug.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="editDrug(drug)" class="p-2.5 text-on-surface-variant hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="toggleStatus(drug)" [class]="drug.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'" class="p-2.5 rounded-xl transition-all" [title]="drug.isActive ? 'Deactivate' : 'Activate'">
                          @if (drug.isActive) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                          }
                          @if (!drug.isActive) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredDrugs().length === 0) {
                  <tr>
                    <td colspan="4" class="px-8 py-24 text-center">
                      <div class="p-6 bg-surface-variant/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-on-surface-variant/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <h3 class="text-xl font-black text-on-surface">No medications found</h3>
                      <p class="text-on-surface-variant font-medium mt-1">Refine your search or add a new drug to the repository</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
    
        <!-- Drug Form Modal: Master-Detail Design -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div class="bg-surface border border-border rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <!-- Modal Header -->
              <div class="px-10 py-8 border-b border-border/50 bg-surface-variant/5 flex justify-between items-center">
                <div>
                  <h2 class="text-3xl font-black text-on-surface tracking-tight">{{ editingDrug ? 'Refine' : 'Add New' }} Drug</h2>
                  <p class="text-on-surface-variant font-medium mt-1">Configure master data and default prescription details</p>
                </div>
                <button (click)="closeModal()" class="p-3 hover:bg-surface-variant/50 rounded-2xl transition-all text-on-surface-variant hover:text-rose-500">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div class="p-10 overflow-y-auto custom-scrollbar space-y-10">
                <!-- Master Data Section -->
                <section class="space-y-6">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-black">M</div>
                    <h3 class="text-[12px] font-black uppercase tracking-[0.3em] text-primary-600">Master Data Identification</h3>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Brand Name</label>
                      <input type="text" [(ngModel)]="drugForm.brandName" placeholder="e.g. Napa Extend" class="w-full px-5 py-4 bg-surface-variant/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-on-surface">
                    </div>
                    <!-- Generic Name -->
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Generic Name</label>
                      <select [(ngModel)]="drugForm.genericId" class="w-full px-5 py-4 bg-surface-variant/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                        <option [ngValue]="0" disabled>Select Generic</option>
                        @for (g of generics(); track g) {
                          <option [ngValue]="g.id">{{ g.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Company / Manufacturer</label>
                      <select [(ngModel)]="drugForm.drugCompanyId" class="w-full px-5 py-4 bg-surface-variant/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                        <option [ngValue]="0" disabled>Select Company</option>
                        @for (c of companies(); track c) {
                          <option [ngValue]="c.id">{{ c.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">SKU / Code</label>
                      <input type="text" [(ngModel)]="drugForm.sku" placeholder="DRG-001" class="w-full px-5 py-4 bg-surface-variant/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-on-surface">
                    </div>
                  </div>
                </section>
                <!-- Detail Data Section -->
                <section class="space-y-6 pt-6 border-t border-border/50">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                      <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">D</div>
                      <h3 class="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-600">Prescription Details (Variations)</h3>
                    </div>
                    <button (click)="addDetail()" class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100">
                      + Add Variation
                    </button>
                  </div>
                  <!-- Type removed from Master and moved to details below -->
                  <div class="space-y-3">
                    @for (detail of drugForm.details; track detail; let i = $index) {
                      <div class="p-4 bg-surface-variant/5 border border-border/50 rounded-2xl flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
                        <!-- Type -->
                        <div class="flex-1 space-y-2 w-full">
                          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Type (Form)</label>
                          <select [(ngModel)]="detail.drugTypeId" class="w-full px-4 py-3 bg-surface-variant/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm">
                            <option [ngValue]="0" disabled>Select Type</option>
                            @for (type of drugTypes; track type) {
                              <option [ngValue]="type.id">{{ type.name }}</option>
                            }
                          </select>
                        </div>
                        <!-- Strength -->
                        <div class="flex-1 space-y-2 w-full">
                          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Strength</label>
                          <select [(ngModel)]="detail.drugStrengthId" class="w-full px-4 py-3 bg-surface-variant/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm">
                            <option [ngValue]="0" disabled>Select Strength</option>
                            @for (s of drugStrengths; track s) {
                              <option [ngValue]="s.id">{{ s.name }}</option>
                            }
                          </select>
                        </div>
                        <!-- Unit Price -->
                        <div class="flex-1 space-y-2 w-full">
                          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Unit Price</label>
                          <div class="relative group">
                            <span class="absolute left-4 top-3.5 text-on-surface-variant/40 font-bold text-sm group-focus-within:text-emerald-500">৳</span>
                            <input type="number" [(ngModel)]="detail.unitPrice" placeholder="0.00" class="w-full pl-9 pr-4 py-3 bg-surface-variant/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm text-on-surface">
                          </div>
                        </div>
                        <!-- Description -->
                        <div class="flex-[2] space-y-2 w-full">
                          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 ml-1">Description / Note</label>
                          <input type="text" [(ngModel)]="detail.description" placeholder="e.g. Sugar Free" class="w-full px-4 py-3 bg-surface-variant/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm text-on-surface">
                        </div>
                        <!-- Remove -->
                        <button (click)="removeDetail(i)" class="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Remove Variation">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    }
                    @if (drugForm.details.length === 0) {
                      <div class="p-8 text-center text-on-surface-variant/50 border border-dashed border-border rounded-2xl">
                        No variations added. Please add at least one Type + Strength combination.
                      </div>
                    }
                    @if (hasDuplicateDetails()) {
                      <div class="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold animate-in fade-in">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Duplicate variation detected! Each combination of Type and Strength must be unique.
                      </div>
                    }
                  </div>
                </section>
                <div class="flex items-center gap-4 p-6 bg-primary-50 rounded-3xl border border-primary-100 group cursor-pointer" (click)="drugForm.isActive = !drugForm.isActive">
                  <div class="relative w-12 h-6 rounded-full transition-colors duration-300" [class.bg-primary-600]="drugForm.isActive" [class.bg-gray-300]="!drugForm.isActive">
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm" [class.translate-x-6]="drugForm.isActive"></div>
                  </div>
                  <div>
                    <p class="text-sm font-black text-on-surface">Mark as Active</p>
                    <p class="text-[10px] text-on-surface-variant/60 font-medium">Make this drug available for prescriptions immediately</p>
                  </div>
                </div>
              </div>
              <!-- Modal Footer -->
              <button (click)="closeModal()" class="flex-1 py-4 border border-border rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-on-surface-variant hover:bg-surface-variant/50 transition-all hover:shadow-inner">Cancel Changes</button>
              <button
                (click)="saveDrug()"
                [disabled]="!isFormValid()"
                [class.opacity-50]="!isFormValid()"
                [class.cursor-not-allowed]="!isFormValid()"
                class="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-700 transition-all shadow-xl hover:shadow-primary-500/30 active:scale-95 disabled:hover:bg-primary-600 disabled:shadow-none"
                >
                Save Medication Data
              </button>
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

  public drugs = signal<any[]>([]);
  public filteredDrugs = signal<any[]>([]);
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
    this.typeService.getDrugTypes({ page: 1, pageSize: 100 } as any).subscribe({
      next: (response) => {
        const data = (response as any)?.data?.itemList || (response as any)?.data || [];
        this.drugTypes = data.map((t: any) => ({
          id: Number(t.id || 0),
          name: t.name
        }));
      },
      error: (err) => console.error('Error loading drug types:', err)
    });

    // Load drug strengths
    this.strengthService.getDrugStrengths({ page: 1, pageSize: 100 }).subscribe({
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
    this.drugService.getDrugs({ page: 1, pageSize: 1000 } as any).subscribe({
      next: (response) => {
        // Handle ViewResponseViewModel structure
        const data = (response as any)?.data?.itemList || (response as any)?.data || [];
        const mapped = data.map((drug: DrugViewModel) => {
          // Get first drug detail for generic and strength
          const firstDetail = (drug as any).drugDetailList?.[0];
          return {
            id: drug.encryptedId,
            encryptedId: drug.encryptedId,
            brandName: drug.name,
            genericName: firstDetail?.genericName || '',
            company: (drug as any).drugCompanyName || (drug as any).manufacturerName || '',
            sku: (drug as any).code || '',
            type: drug.drugTypeName || '',
            // Map details list
            details: (drug as any).drugDetailList?.map((d: any) => ({
              drugTypeEncryptedId: d.drugTypeEncryptedId, // These IDs might not be in View Model, but map name for now
              type: d.drugTypeName,
              strength: d.strengthName,
              unitPrice: d.unitPrice,
              description: d.description || ''
            })) || [],
            // These single fields are legacy/fallback for list view
            strength: firstDetail?.strengthName || '',
            dose: (drug as any).drugDoseName || '',
            duration: (drug as any).drugDurationName || '',
            advice: '',
            description: drug.description || '',
            isActive: drug.isActive
          };
        });
        this.drugs.set(mapped);
        this.filterDrugs();
      },
      error: (err) => {
        console.error('Error loading drugs:', err);
        this.drugs.set([]);
        this.filterDrugs();
      }
    });
  }

  filterDrugs(): void {
    let list = this.drugs();

    if (this.selectedType !== 'All') {
      list = list.filter(d => d.type === this.selectedType);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(d =>
        d.brandName.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q)
      );
    }

    this.filteredDrugs.set(list);
  }

  openModal(): void {
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
    this.editingDrug = drug;
    // Fetch full data with specific IDs for editing
    this.drugService.getDrugById(drug.encryptedId).subscribe({
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
        alert('Failed to load drug details for editing.');
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
          this.loadDrugs();
          this.closeModal();
        },
        error: (err) => console.error('Error updating drug:', err)
      });
    } else {
      this.drugService.createDrug(dto).subscribe({
        next: () => {
          this.loadDrugs();
          this.closeModal();
        },
        error: (err) => console.error('Error creating drug:', err)
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
      alert('Please correct the following fields before saving:\n\n• ' + reasons.join('\n• '));
    }
  }

  toggleStatus(drug: any): void {
    if (drug.encryptedId) {
      this.drugService.changeDrugActiveStatus(drug.encryptedId).subscribe({
        next: () => {
          this.loadDrugs();
        },
        error: (err) => {
          console.error('Error toggling drug status:', err);
          alert('Failed to change status. Please try again.');
        }
      });
    }
  }
}
