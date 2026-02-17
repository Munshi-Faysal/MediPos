import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SystemPackageService } from '../../../core/services/system-package.service';
import { Feature, Package } from '../../../core/models/system-package.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-on-surface tracking-tight">System Packages</h1>
          <p class="text-on-surface-variant mt-1">Configure service plans and feature availability</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="activeTab.set('packages')"
            [class]="activeTab() === 'packages' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-surface text-on-surface-variant hover:bg-surface-variant'"
            class="px-4 py-2 rounded-lg font-bold transition-all text-sm"
            >
            Packages
          </button>
          <button
            (click)="activeTab.set('features')"
            [class]="activeTab() === 'features' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-surface text-on-surface-variant hover:bg-surface-variant'"
            class="px-4 py-2 rounded-lg font-bold transition-all text-sm"
            >
            Features
          </button>
        </div>
      </div>
    
      <!-- Packages Tab -->
      @if (activeTab() === 'packages') {
        <div class="space-y-6">
          <div class="flex justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-soft">
            <div class="relative flex-1 max-w-md">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-on-surface-variant opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                [(ngModel)]="packageSearch"
                placeholder="Search packages..."
                class="w-full pl-10 pr-4 py-2 bg-surface-variant/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <button
                (click)="openPackageModal()"
                class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20"
                >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Package
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (pkg of filteredPackages(); track pkg) {
                <div
                  class="bg-surface border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all group flex flex-col"
                  [class.border-primary-500]="pkg.isPopular"
                  >
                  <div class="p-6 flex-1">
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h3 class="text-xl font-black text-on-surface">{{ pkg.packageName }}</h3>
                        @if (pkg.isPopular) {
                          <span class="text-[10px] font-black uppercase tracking-widest bg-primary-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Popular</span>
                        }
                      </div>
                      <div class="flex items-center gap-2">
                        <span
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          [class]="pkg.isActive ? 'bg-success-500/10 text-success-600' : 'bg-rose-500/10 text-rose-600'"
                          >
                          {{ pkg.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                    <p class="text-sm text-on-surface-variant mb-6 line-clamp-2">{{ pkg.description || 'No description provided.' }}</p>
                    <div class="mb-6">
                      <span class="text-4xl font-black text-primary-600">{{ pkg.price | currency }}</span>
                      <span class="text-on-surface-variant text-sm font-medium"> / {{ pkg.durationInDays }} days</span>
                    </div>
                    <div class="space-y-2 mb-6">
                      <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Features Included</p>
                      <div class="flex flex-wrap gap-1.5">
                        @for (feat of pkg.features; track feat) {
                          <span
                            class="px-2 py-1 bg-surface-variant/50 text-on-surface text-[10px] font-bold rounded-md"
                            >
                            {{ feat.featureName }}
                          </span>
                        }
                        @if (!pkg.features?.length) {
                          <span class="text-xs italic text-on-surface-variant">No features assigned</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="p-4 bg-surface-variant/30 border-t border-border flex items-center justify-between">
                    <span class="text-[10px] font-bold text-on-surface-variant">{{ pkg.userLimit === -1 ? 'Unlimited' : pkg.userLimit }} Users</span>
                    <div class="flex items-center gap-2">
                      <button
                        (click)="openPackageModal(pkg)"
                        class="p-2 text-on-surface-variant hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-all"
                        >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        (click)="togglePackageStatus(pkg)"
                        [title]="pkg.isActive ? 'Deactivate' : 'Activate'"
                        class="p-2 text-on-surface-variant hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-all"
                        >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
              <!-- Empty State -->
              @if (filteredPackages().length === 0) {
                <div class="col-span-full py-20 bg-surface rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                  <div class="w-16 h-16 bg-surface-variant/50 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-on-surface">No packages found</h3>
                  <p class="text-on-surface-variant">Try adjusting your search or create a new package.</p>
                </div>
              }
            </div>
          </div>
        }
    
        <!-- Features Tab -->
        @if (activeTab() === 'features') {
          <div class="space-y-6">
            <div class="flex justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-soft">
              <div class="relative flex-1 max-w-md">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-on-surface-variant opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  [(ngModel)]="featureSearch"
                  placeholder="Search features..."
                  class="w-full pl-10 pr-4 py-2 bg-surface-variant/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <button
                  (click)="openFeatureModal()"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  New Feature
                </button>
              </div>
              <div class="bg-surface border border-border rounded-2xl overflow-hidden shadow-soft">
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-surface-variant/30 border-b border-border">
                        <th class="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Feature Name</th>
                        <th class="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Description</th>
                        <th class="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                        <th class="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      @for (feat of filteredFeatures(); track feat) {
                        <tr class="hover:bg-surface-variant/10 transition-colors">
                          <td class="px-6 py-4">
                            <span class="font-bold text-on-surface">{{ feat.featureName }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-sm text-on-surface-variant">{{ feat.description || '---' }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              [class]="feat.isActive ? 'bg-success-500/10 text-success-600' : 'bg-rose-500/10 text-rose-600'"
                              >
                              {{ feat.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                              <button
                                (click)="openFeatureModal(feat)"
                                class="p-2 text-on-surface-variant hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-all"
                                >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                              </button>
                              <button
                                (click)="toggleFeatureStatus(feat)"
                                [title]="feat.isActive ? 'Deactivate' : 'Activate'"
                                class="p-2 text-on-surface-variant hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-all"
                                >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                      @if (filteredFeatures().length === 0) {
                        <tr>
                          <td colspan="4" class="px-6 py-20 text-center">
                            <p class="text-on-surface-variant">No features found.</p>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
    
          <!-- Package Modal -->
          @if (isPackageModalOpen()) {
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
                <div class="p-6 border-b border-border flex justify-between items-center">
                  <h3 class="text-xl font-black text-on-surface">{{ editingPackage ? 'Edit Package' : 'Create New Package' }}</h3>
                  <button (click)="closePackageModal()" class="text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-variant transition-all">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div class="p-6 overflow-y-auto flex-1 h-full scrollbar-hide">
                  <form [formGroup]="packageForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="form-label">Package Name</label>
                        <input type="text" formControlName="packageName" class="form-input" placeholder="e.g. Premium Plus" />
                      </div>
                      <div>
                        <label class="form-label">Price (USD)</label>
                        <input type="number" formControlName="price" class="form-input" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Description</label>
                      <textarea formControlName="description" class="form-input min-h-[80px]" placeholder="Brief summary of the package..."></textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="form-label">Duration (Days)</label>
                        <input type="number" formControlName="durationInDays" class="form-input" placeholder="30" />
                      </div>
                      <div>
                        <label class="form-label">User Limit (-1 for unlimited)</label>
                        <input type="number" formControlName="userLimit" class="form-input" placeholder="5" />
                      </div>
                    </div>
                    <div class="flex items-center gap-6 p-4 bg-surface-variant/30 rounded-xl">
                      <label class="flex items-center gap-3 cursor-pointer group">
                        <div class="relative">
                          <input type="checkbox" formControlName="isPopular" class="sr-only peer" />
                          <div class="w-10 h-6 bg-border peer-checked:bg-primary-600 rounded-full transition-all duration-300"></div>
                          <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></div>
                        </div>
                        <span class="text-sm font-bold text-on-surface group-hover:text-primary-600 transition-colors">Mark as Popular</span>
                      </label>
                      <label class="flex items-center gap-3 cursor-pointer group">
                        <div class="relative">
                          <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                          <div class="w-10 h-6 bg-border peer-checked:bg-success-600 rounded-full transition-all duration-300"></div>
                          <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></div>
                        </div>
                        <span class="text-sm font-bold text-on-surface group-hover:text-success-600 transition-colors">Is Active</span>
                      </label>
                    </div>
                    <div>
                      <label class="form-label mb-3">Include Features</label>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2 scrollbar-hide">
                        @for (feat of allFeatures(); track feat) {
                          <label class="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group">
                            <input
                              type="checkbox"
                              [checked]="selectedFeatureIds().includes(feat.encryptedId!)"
                              (change)="toggleFeatureInPackage(feat.encryptedId!)"
                              class="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
                              />
                              <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-on-surface group-hover:text-primary-600 transition-colors truncate">{{ feat.featureName }}</p>
                              </div>
                            </label>
                          }
                        </div>
                      </div>
                    </form>
                  </div>
                  <div class="p-6 border-t border-border flex justify-end gap-3 bg-surface-variant/10">
                    <button (click)="closePackageModal()" class="px-5 py-2 text-on-surface-variant font-bold hover:text-on-surface transition-all">Cancel</button>
                    <button
                      (click)="savePackage()"
                      [disabled]="packageForm.invalid || isSubmitting()"
                      class="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
                      >
                      @if (isSubmitting()) {
                        <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      {{ editingPackage ? 'Update Package' : 'Create Package' }}
                    </button>
                  </div>
                </div>
              </div>
            }
    
            <!-- Feature Modal -->
            @if (isFeatureModalOpen()) {
              <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full animate-slide-in">
                  <div class="p-6 border-b border-border flex justify-between items-center">
                    <h3 class="text-xl font-black text-on-surface">{{ editingFeature ? 'Edit Feature' : 'Create New Feature' }}</h3>
                    <button (click)="closeFeatureModal()" class="text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-variant transition-all">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="p-6">
                    <form [formGroup]="featureForm" class="space-y-4">
                      <div>
                        <label class="form-label">Feature Name</label>
                        <input type="text" formControlName="featureName" class="form-input" placeholder="e.g. Advanced AI Analytics" />
                      </div>
                      <div>
                        <label class="form-label">Description</label>
                        <textarea formControlName="description" class="form-input min-h-[100px]" placeholder="Explain what this feature provides..."></textarea>
                      </div>
                      <div class="flex items-center gap-3 p-3 bg-surface-variant/30 rounded-xl">
                        <label class="flex items-center gap-3 cursor-pointer group">
                          <div class="relative">
                            <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                            <div class="w-10 h-6 bg-border peer-checked:bg-success-600 rounded-full transition-all duration-300"></div>
                            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></div>
                          </div>
                          <span class="text-sm font-bold text-on-surface group-hover:text-success-600 transition-colors">Feature Is Active</span>
                        </label>
                      </div>
                    </form>
                  </div>
                  <div class="p-6 border-t border-border flex justify-end gap-3 bg-surface-variant/10 rounded-b-2xl">
                    <button (click)="closeFeatureModal()" class="px-5 py-2 text-on-surface-variant font-bold hover:text-on-surface transition-all">Cancel</button>
                    <button
                      (click)="saveFeature()"
                      [disabled]="featureForm.invalid || isSubmitting()"
                      class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                      >
                      @if (isSubmitting()) {
                        <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      {{ editingFeature ? 'Update Feature' : 'Create Feature' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
    `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class PackagesComponent implements OnInit {
  private packageService = inject(SystemPackageService);
  private nf = inject(NotificationService);
  private fb = inject(FormBuilder);

  public activeTab = signal<'packages' | 'features'>('packages');
  public isSubmitting = signal(false);

  // Data State
  public allPackages = signal<Package[]>([]);
  public allFeatures = signal<Feature[]>([]);

  // Search State
  public packageSearch = '';
  public featureSearch = '';

  // Modal State - Packages
  public isPackageModalOpen = signal(false);
  public editingPackage: Package | null = null;
  public packageForm: FormGroup;
  public selectedFeatureIds = signal<string[]>([]);

  // Modal State - Features
  public isFeatureModalOpen = signal(false);
  public editingFeature: Feature | null = null;
  public featureForm: FormGroup;

  // Computed Filters
  public filteredPackages = computed(() => {
    const search = this.packageSearch.toLowerCase();
    return this.allPackages().filter(p =>
      (p.packageName || p.name).toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  });

  public filteredFeatures = computed(() => {
    const search = this.featureSearch.toLowerCase();
    return this.allFeatures().filter(f =>
      (f.featureName || f.name).toLowerCase().includes(search) ||
      f.description?.toLowerCase().includes(search)
    );
  });

  constructor() {
    this.packageForm = this.fb.group({
      packageName: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      userLimit: [5, [Validators.required]],
      isPopular: [false],
      isActive: [true]
    });

    this.featureForm = this.fb.group({
      featureName: ['', [Validators.required]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.packageService.getPackages().subscribe(pkgs => this.allPackages.set(pkgs));
    this.packageService.getFeatures().subscribe(fs => this.allFeatures.set(fs));
  }

  // --- Package Logic ---
  openPackageModal(pkg: Package | null = null): void {
    this.editingPackage = pkg;
    if (pkg) {
      this.packageForm.patchValue(pkg);
      this.selectedFeatureIds.set(pkg.features?.map(f => f.encryptedId!).filter(id => !!id) || []);
    } else {
      this.packageForm.reset({
        packageName: '',
        description: '',
        price: 0,
        durationInDays: 30,
        userLimit: 5,
        isPopular: false,
        isActive: true
      });
      this.selectedFeatureIds.set([]);
    }
    this.isPackageModalOpen.set(true);
  }

  closePackageModal(): void {
    this.isPackageModalOpen.set(false);
    this.editingPackage = null;
  }

  toggleFeatureInPackage(featureId: string): void {
    this.selectedFeatureIds.update(ids =>
      ids.includes(featureId) ? ids.filter(id => id !== featureId) : [...ids, featureId]
    );
  }

  savePackage(): void {
    if (this.packageForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.packageForm.value;
    const featureIds = this.selectedFeatureIds();

    if (this.editingPackage) {
      this.packageService.updatePackage({ ...this.editingPackage, ...formData }, featureIds).subscribe({
        next: (res) => {
          this.allPackages.update(pkgs => pkgs.map(p => p.encryptedId === res.encryptedId ? res : p));
          this.nf.success('Package Updated', 'The package has been successfully updated.');
          this.isSubmitting.set(false);
          this.closePackageModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.packageService.addPackage(formData, featureIds).subscribe({
        next: (res) => {
          this.allPackages.update(pkgs => [...pkgs, res]);
          this.nf.success('Package Created', 'New package has been successfully created.');
          this.isSubmitting.set(false);
          this.closePackageModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  togglePackageStatus(pkg: Package): void {
    const updated = { ...pkg, isActive: !pkg.isActive };
    const fIds = pkg.features?.map(f => f.encryptedId!).filter(id => !!id) || [];
    this.packageService.updatePackage(updated, fIds).subscribe(res => {
      this.allPackages.update(pkgs => pkgs.map(p => p.encryptedId === res.encryptedId ? res : p));
      this.nf.info('Status Updated', `Package ${pkg.packageName || pkg.name} is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
    });
  }

  // --- Feature Logic ---
  openFeatureModal(feat: Feature | null = null): void {
    this.editingFeature = feat;
    if (feat) {
      this.featureForm.patchValue(feat);
    } else {
      this.featureForm.reset({
        featureName: '',
        description: '',
        isActive: true
      });
    }
    this.isFeatureModalOpen.set(true);
  }

  closeFeatureModal(): void {
    this.isFeatureModalOpen.set(false);
    this.editingFeature = null;
  }

  saveFeature(): void {
    if (this.featureForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.featureForm.value;

    if (this.editingFeature) {
      this.packageService.updateFeature({ ...this.editingFeature, ...formData }).subscribe({
        next: (res) => {
          this.allFeatures.update(fs => fs.map(f => f.encryptedId === res.encryptedId ? res : f));
          this.nf.success('Feature Updated', 'The feature has been successfully updated.');
          this.isSubmitting.set(false);
          this.closeFeatureModal();
          this.loadData(); // Refresh packages to reflect feature name changes
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.packageService.addFeature(formData).subscribe({
        next: (res) => {
          this.allFeatures.update(fs => [...fs, res]);
          this.nf.success('Feature Created', 'New feature has been successfully created.');
          this.isSubmitting.set(false);
          this.closeFeatureModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  toggleFeatureStatus(feat: Feature): void {
    const updated = { ...feat, isActive: !feat.isActive };
    this.packageService.updateFeature(updated).subscribe(res => {
      this.allFeatures.update(fs => fs.map(f => f.encryptedId === res.encryptedId ? res : f));
      this.nf.info('Status Updated', `Feature ${feat.featureName || feat.name} is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
      this.loadData(); // Refresh packages to reflect status changes
    });
  }
}
