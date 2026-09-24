import { Component, OnInit, signal, computed, inject } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SystemPackageService } from '../../../core/services/system-package.service';
import { Feature, Package, PackageFeature } from '../../../core/models/system-package.model';
import { NotificationService } from '../../../core/services/notification.service';
import Swal from 'sweetalert2';

type ModalType = 'package' | 'feature' | 'packageFeature' | null;

@Component({
  selector: 'app-packages-module',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Package Management</h1>
          <p class="text-sm text-on-surface-variant mt-0.5">Manage subscription packages, features & pricing tiers</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-on-surface-variant shadow-soft flex items-center gap-2">
            <span>Total Packages:</span>
            <span class="font-bold text-primary-600 text-sm">{{ allPackages().length }}</span>
          </div>
          <div class="px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-on-surface-variant shadow-soft flex items-center gap-2">
            <span>Total Features:</span>
            <span class="font-bold text-emerald-600 text-sm">{{ allFeatures().length }}</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <!-- FEATURES TABLE -->
        <div class="bg-surface border border-border rounded-xl shadow-soft overflow-hidden flex flex-col">
          <div class="p-5 border-b border-border bg-surface-variant/10 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-on-surface flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Features
              </h2>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ allFeatures().length }} available features</p>
            </div>
            <button
              (click)="openModal('feature')"
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Feature
            </button>
          </div>

          <div class="p-4 flex-1 overflow-auto max-h-[620px] space-y-3">
            @for (feature of allFeatures(); track feature) {
              <div class="p-4 bg-surface border border-border rounded-xl hover:border-emerald-500/40 transition-all">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h3 class="font-semibold text-on-surface text-sm">{{ feature.name }}</h3>
                    <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">{{ feature.description || 'No description provided' }}</p>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex-shrink-0"
                    [class]="feature.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                    >
                    {{ feature.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    (click)="editFeature(feature)"
                    class="px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-500/10 rounded-md transition-colors flex items-center gap-1"
                    >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    (click)="toggleFeatureStatus(feature)"
                    [class]="feature.isActive ? 'text-amber-600 hover:bg-amber-500/10' : 'text-emerald-600 hover:bg-emerald-500/10'"
                    class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                    >
                    {{ feature.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    (click)="deleteFeature(feature)"
                    class="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-1 ml-auto"
                    >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            }

            @if (allFeatures().length === 0) {
              <div class="text-center py-12 text-on-surface-variant">
                <div class="w-12 h-12 bg-surface-variant/40 rounded-full flex items-center justify-center mx-auto mb-2 text-on-surface-variant">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p class="text-sm font-medium">No features created yet</p>
              </div>
            }
          </div>
        </div>

        <!-- PACKAGES TABLE -->
        <div class="bg-surface border border-border rounded-xl shadow-soft overflow-hidden flex flex-col">
          <div class="p-5 border-b border-border bg-surface-variant/10 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-on-surface flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                Packages
              </h2>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ allPackages().length }} subscription plans</p>
            </div>
            <button
              (click)="openModal('package')"
              class="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Package
            </button>
          </div>

          <div class="p-4 flex-1 overflow-auto max-h-[620px] space-y-3">
            @for (pkg of allPackages(); track pkg) {
              <div class="p-4 bg-surface border border-border rounded-xl hover:border-primary-500/40 transition-all space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-on-surface text-base">{{ pkg.name }}</h3>
                      @if (pkg.isPopular) {
                        <span class="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Popular
                        </span>
                      }
                    </div>
                    <p class="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{{ pkg.description || 'No description provided' }}</p>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex-shrink-0"
                    [class]="pkg.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                    >
                    {{ pkg.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <!-- Pricing & Duration Banner -->
                <div class="flex items-center gap-4 p-3 bg-surface-variant/20 rounded-lg border border-border">
                  <div class="flex-1">
                    <span class="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">Price</span>
                    <p class="text-lg font-bold text-primary-600">৳{{ pkg.price }}</p>
                  </div>
                  <div class="w-px h-8 bg-border"></div>
                  <div class="flex-1">
                    <span class="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">Duration</span>
                    <p class="text-sm font-semibold text-on-surface">{{ pkg.duration }}</p>
                  </div>
                </div>

                @if (pkg.featureList && pkg.featureList.length > 0) {
                  <div>
                    <span class="text-[11px] font-semibold text-on-surface-variant block mb-1.5">Includes:</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (feat of (expandedPackages().includes(pkg.encryptedId || '') ? pkg.featureList : pkg.featureList.slice(0, 5)); track feat) {
                        <span class="px-2 py-0.5 bg-surface-variant/40 border border-border/60 text-on-surface text-xs font-medium rounded-md">
                          {{ feat }}
                        </span>
                      }
                      @if (pkg.featureList.length > 5 && !expandedPackages().includes(pkg.encryptedId || '')) {
                        <button
                          (click)="togglePackageExpansion(pkg.encryptedId || '', $event)"
                          class="px-2 py-0.5 text-primary-600 hover:text-primary-700 text-xs font-semibold"
                          >
                          +{{ pkg.featureList.length - 5 }} More
                        </button>
                      }
                      @if (pkg.featureList.length > 5 && expandedPackages().includes(pkg.encryptedId || '')) {
                        <button
                          (click)="togglePackageExpansion(pkg.encryptedId || '', $event)"
                          class="px-2 py-0.5 text-on-surface-variant hover:text-on-surface text-xs font-semibold"
                          >
                          Show Less
                        </button>
                      }
                    </div>
                  </div>
                }

                <div class="flex items-center gap-2 pt-3 border-t border-border">
                  <button
                    (click)="editPackage(pkg)"
                    class="px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-500/10 rounded-md transition-colors flex items-center gap-1"
                    >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    (click)="togglePackageStatus(pkg)"
                    [class]="pkg.isActive ? 'text-amber-600 hover:bg-amber-500/10' : 'text-emerald-600 hover:bg-emerald-500/10'"
                    class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                    >
                    {{ pkg.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    (click)="deletePackage(pkg)"
                    class="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-1 ml-auto"
                    >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            }

            @if (allPackages().length === 0) {
              <div class="text-center py-12 text-on-surface-variant">
                <div class="w-12 h-12 bg-surface-variant/40 rounded-full flex items-center justify-center mx-auto mb-2 text-on-surface-variant">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <p class="text-sm font-medium">No packages created yet</p>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Feature Modal -->
      @if (activeModal() === 'feature') {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" (click)="closeModal()">
          <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
            <div class="px-6 py-5 border-b border-border bg-surface flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-on-surface">{{ editingFeature ? 'Edit Feature' : 'Create Feature' }}</h3>
                <p class="text-xs text-on-surface-variant mt-0.5">Define feature name and details</p>
              </div>
              <button (click)="closeModal()" class="p-2 hover:bg-surface-variant rounded-lg transition-all text-on-surface-variant hover:text-on-surface">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form [formGroup]="featureForm" class="p-6 space-y-4">
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Feature Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all"
                  placeholder="e.g. Advanced Analytics"
                  />
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all resize-none"
                  placeholder="Describe this feature..."
                ></textarea>
              </div>
              <div class="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl border border-border cursor-pointer select-none" (click)="featureForm.patchValue({ isActive: !featureForm.get('isActive')?.value })">
                <div class="relative w-10 h-5 rounded-full transition-colors duration-200" [class.bg-emerald-600]="featureForm.get('isActive')?.value" [class.bg-surface-variant]="!featureForm.get('isActive')?.value">
                  <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="featureForm.get('isActive')?.value"></div>
                </div>
                <div>
                  <p class="text-xs font-semibold text-on-surface">Active Status</p>
                  <p class="text-[11px] text-on-surface-variant">Enable this feature for packages</p>
                </div>
              </div>
            </form>
            <div class="px-6 py-4 border-t border-border bg-surface flex justify-end gap-3">
              <button (click)="closeModal()" class="px-4 py-2 border border-border rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-variant transition-all">
                Cancel
              </button>
              <button
                (click)="saveFeature()"
                [disabled]="featureForm.invalid || isSubmitting()"
                class="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md"
                >
                {{ editingFeature ? 'Update' : 'Create' }} Feature
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Package Modal -->
      @if (activeModal() === 'package') {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" (click)="closeModal()">
          <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
            <div class="px-6 py-5 border-b border-border bg-surface flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-on-surface">{{ editingPackage ? 'Edit Package' : 'Create Package' }}</h3>
                <p class="text-xs text-on-surface-variant mt-0.5">Configure package pricing, duration and features</p>
              </div>
              <button (click)="closeModal()" class="p-2 hover:bg-surface-variant rounded-lg transition-all text-on-surface-variant hover:text-on-surface">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form [formGroup]="packageForm" class="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Package Name *</label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all"
                    placeholder="e.g. Premium Plus"
                    />
                </div>
                <div>
                  <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Price (BDT) *</label>
                  <input
                    type="number"
                    formControlName="price"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all"
                    placeholder="0.00"
                    />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Description</label>
                <textarea
                  formControlName="description"
                  rows="2"
                  class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all resize-none"
                  placeholder="Brief summary..."
                ></textarea>
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Duration *</label>
                <input
                  type="text"
                  formControlName="duration"
                  class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm text-on-surface transition-all"
                  placeholder="e.g. 1 Month, 30 Days"
                  />
              </div>

              <!-- Feature Selection inside Package Modal -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold text-on-surface-variant">Select Features *</label>
                  <button
                    type="button"
                    (click)="toggleSelectAllFeatures()"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                    {{ selectedFeatureIds().length === allFeatures().length ? 'Deselect All' : 'Select All' }}
                  </button>
                </div>
                <div class="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto p-2 bg-surface-variant/20 border border-border rounded-xl">
                  @for (feat of allFeatures(); track feat) {
                    <label
                      class="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border"
                      [class]="selectedFeatureIds().includes(feat.encryptedId || '') ? 'border-primary-500/50 bg-primary-500/10' : 'bg-surface border-border hover:border-border/80'"
                      >
                      <input
                        type="checkbox"
                        [checked]="selectedFeatureIds().includes(feat.encryptedId || '')"
                        (change)="toggleFeatureSelection(feat.encryptedId || '')"
                        class="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
                        />
                      <span class="text-xs font-medium text-on-surface">{{ feat.name }}</span>
                    </label>
                  }
                  @if (allFeatures().length === 0) {
                    <p class="text-xs text-on-surface-variant text-center py-4">No features available yet. Create features first.</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl border border-border cursor-pointer select-none" (click)="packageForm.patchValue({ isPopular: !packageForm.get('isPopular')?.value })">
                  <div class="relative w-10 h-5 rounded-full transition-colors duration-200" [class.bg-amber-500]="packageForm.get('isPopular')?.value" [class.bg-surface-variant]="!packageForm.get('isPopular')?.value">
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="packageForm.get('isPopular')?.value"></div>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-on-surface">Popular</p>
                    <p class="text-[10px] text-on-surface-variant">Featured badge</p>
                  </div>
                </div>

                <div class="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl border border-border cursor-pointer select-none" (click)="packageForm.patchValue({ isActive: !packageForm.get('isActive')?.value })">
                  <div class="relative w-10 h-5 rounded-full transition-colors duration-200" [class.bg-emerald-600]="packageForm.get('isActive')?.value" [class.bg-surface-variant]="!packageForm.get('isActive')?.value">
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="packageForm.get('isActive')?.value"></div>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-on-surface">Active</p>
                    <p class="text-[10px] text-on-surface-variant">Available for purchase</p>
                  </div>
                </div>
              </div>
            </form>
            <div class="px-6 py-4 border-t border-border bg-surface flex justify-end gap-3">
              <button (click)="closeModal()" class="px-4 py-2 border border-border rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-variant transition-all">
                Cancel
              </button>
              <button
                (click)="savePackage()"
                [disabled]="packageForm.invalid || isSubmitting()"
                class="px-5 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md"
                >
                {{ editingPackage ? 'Update' : 'Create' }} Package
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { 
      animation: fadeIn 0.3s ease-out; 
    }
    .animate-slide-up { 
      animation: slideUp 0.3s ease-out; 
    }
    @keyframes fadeIn { 
      from { opacity: 0; } 
      to { opacity: 1; } 
    }
    @keyframes slideUp { 
      from { transform: translateY(20px); opacity: 0; } 
      to { transform: translateY(0); opacity: 1; } 
    }
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }
    .scrollbar-thumb-emerald-400::-webkit-scrollbar-thumb {
      background-color: rgb(52 211 153);
      border-radius: 3px;
    }
    .dark .scrollbar-thumb-emerald-600::-webkit-scrollbar-thumb {
      background-color: rgb(5 150 105);
      border-radius: 3px;
    }
    .scrollbar-thumb-indigo-400::-webkit-scrollbar-thumb {
      background-color: rgb(129 140 248);
      border-radius: 3px;
    }
    .dark .scrollbar-thumb-indigo-600::-webkit-scrollbar-thumb {
      background-color: rgb(79 70 229);
      border-radius: 3px;
    }
    .scrollbar-thumb-pink-400::-webkit-scrollbar-thumb {
      background-color: rgb(244 114 182);
      border-radius: 3px;
    }
    .scrollbar-track-emerald-100::-webkit-scrollbar-track {
      background-color: rgb(209 250 229);
      border-radius: 3px;
    }
    .scrollbar-track-indigo-100::-webkit-scrollbar-track {
      background-color: rgb(224 231 255);
      border-radius: 3px;
    }
    .dark .scrollbar-track-slate-900::-webkit-scrollbar-track {
      background-color: rgb(15 23 42);
      border-radius: 3px;
    }
    .scrollbar-track-pink-100::-webkit-scrollbar-track {
      background-color: rgb(252 231 243);
      border-radius: 3px;
    }
  `]
})
export class PackagesModuleComponent implements OnInit {
  private packageService = inject(SystemPackageService);
  private nf = inject(NotificationService);
  private fb = inject(FormBuilder);

  public activeModal = signal<ModalType>(null);
  public isSubmitting = signal(false);

  // Data State
  public allPackages = signal<Package[]>([]);
  public allFeatures = signal<Feature[]>([]);
  public allPackageFeatures = signal<PackageFeature[]>([]);

  public groupedFeatures = computed(() => {
    const packages = this.allPackages();
    const pfs = this.allPackageFeatures();

    // Group using PackageEncryptedId if available, matching Package.encryptedId
    return packages.map(pkg => {
      const features = pfs.filter(pf => pf.packageEncryptedId === pkg.encryptedId);
      return { pkg, features };
    }).filter(group => group.features.length > 0);
  });

  // Editing State
  public editingPackage: Package | null = null;
  public editingFeature: Feature | null = null;
  public selectedFeatureIds = signal<string[]>([]);
  public expandedPackages = signal<string[]>([]);

  // Forms
  public packageForm: FormGroup;
  public featureForm: FormGroup;

  constructor() {
    this.packageForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: ['30 Days', [Validators.required]],
      isPopular: [false],
      isActive: [true]
    });

    this.featureForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.packageService.getPackages().subscribe(pkgs => {
      console.log('Loaded Packages:', pkgs);
      this.allPackages.set(pkgs);
    });
    this.packageService.getFeatures().subscribe(fs => this.allFeatures.set(fs));
    this.packageService.getPackageFeatures().subscribe(pfs => this.allPackageFeatures.set(pfs));
  }

  // Modal Management
  openModal(type: ModalType): void {
    this.activeModal.set(type);
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.editingPackage = null;
    this.editingFeature = null;
    this.packageForm.reset({ name: '', description: '', price: 0, duration: '30 Days', isPopular: false, isActive: true });
    this.featureForm.reset({ name: '', description: '', isActive: true });
    this.selectedFeatureIds.set([]);
  }

  // Feature Operations
  editFeature(feature: Feature): void {
    this.editingFeature = feature;
    this.featureForm.patchValue(feature);
    this.openModal('feature');
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
          this.closeModal();
          this.loadData();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.packageService.addFeature(formData).subscribe({
        next: (res) => {
          this.allFeatures.update(fs => [...fs, res]);
          this.nf.success('Feature Created', 'New feature has been successfully created.');
          this.isSubmitting.set(false);
          this.closeModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  toggleFeatureStatus(feat: Feature): void {
    if (!feat.encryptedId) return;
    // Optimistic Update
    const updated = { ...feat, isActive: !feat.isActive };
    this.allFeatures.update(fs => fs.map(f => f.encryptedId === feat.encryptedId ? updated : f));

    this.packageService.toggleFeatureStatus(feat).subscribe({
      next: () => {
        this.nf.info('Status Updated', `Feature ${feat.name} is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
      },
      error: () => this.loadData() // Revert on error
    });
  }

  deleteFeature(feat: Feature): void {
    if (!feat.encryptedId) return;

    Swal.fire({
      title: 'Delete Feature?',
      text: `Are you sure you want to delete feature "${feat.name}"? This will also remove it from any linked packages.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.packageService.deleteFeature(feat.encryptedId!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Feature "${feat.name}" has been deleted.`,
              timer: 2000,
              showConfirmButton: false
            });
            this.allFeatures.update(fs => fs.filter(f => f.encryptedId !== feat.encryptedId));
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting feature:', err);
            const errorMessage = err.error?.ExceptionMessage || err.error?.exceptionMessage || err.error?.message || err.error?.Message || 'Failed to delete feature. Please try again.';
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: errorMessage
            });
          }
        });
      }
    });
  }

  // Package Operations
  editPackage(pkg: Package): void {
    this.editingPackage = pkg;
    this.packageForm.patchValue(pkg);

    // Set selected features based on the relationship table
    // We find features that link to this package
    const relatedFeatures = this.allPackageFeatures()
      .filter(pf => pf.packageEncryptedId === pkg.encryptedId)
      .map(pf => pf.featureEncryptedId)
      .filter((id): id is string => !!id);

    this.selectedFeatureIds.set(relatedFeatures);

    this.openModal('package');
  }

  toggleFeatureSelection(featureId: string): void {
    this.selectedFeatureIds.update(ids => {
      if (ids.includes(featureId)) {
        return ids.filter(id => id !== featureId);
      } else {
        return [...ids, featureId];
      }
    });
  }

  togglePackageExpansion(pkgId: string, event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.expandedPackages.update(ids => {
      if (ids.includes(pkgId)) {
        return ids.filter(id => id !== pkgId);
      } else {
        return [...ids, pkgId];
      }
    });
  }

  toggleSelectAllFeatures(): void {
    if (this.selectedFeatureIds().length === this.allFeatures().length) {
      this.selectedFeatureIds.set([]);
    } else {
      const allIds = this.allFeatures()
        .map(f => f.encryptedId)
        .filter((id): id is string => !!id);
      this.selectedFeatureIds.set(allIds);
    }
  }

  savePackage(): void {
    if (this.packageForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.packageForm.value;
    const featureIds = this.selectedFeatureIds();

    console.log('Saving Package with Features:', featureIds);



    if (this.editingPackage) {
      this.packageService.updatePackage({ ...this.editingPackage, ...formData }, featureIds).subscribe({
        next: (res) => {
          this.allPackages.update(pkgs => pkgs.map(p => p.encryptedId === res.encryptedId ? res : p));
          this.nf.success('Package Updated', 'The package has been successfully updated.');
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadData();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.packageService.addPackage(formData, featureIds).subscribe({
        next: (res) => {
          this.allPackages.update(ps => [...ps, res]);
          this.nf.success('Package Created', 'New package has been successfully created.');
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadData(); // Reload to get relationships
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  togglePackageStatus(pkg: Package): void {
    if (!pkg.encryptedId) return;
    // Optimistic
    const updated = { ...pkg, isActive: !pkg.isActive };
    this.allPackages.update(ps => ps.map(p => p.encryptedId === pkg.encryptedId ? updated : p));

    this.packageService.togglePackageStatus(pkg).subscribe({
      next: () => {
        this.nf.info('Status Updated', `Package ${pkg.name} is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
      },
      error: () => this.loadData()
    });
  }

  deletePackage(pkg: Package): void {
    if (!pkg.encryptedId) return;

    Swal.fire({
      title: 'Delete Package?',
      text: `Are you sure you want to delete package "${pkg.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.packageService.deletePackage(pkg.encryptedId!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Package "${pkg.name}" has been deleted.`,
              timer: 2000,
              showConfirmButton: false
            });
            this.allPackages.update(ps => ps.filter(p => p.encryptedId !== pkg.encryptedId));
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting package:', err);
            const errorMessage = err.error?.ExceptionMessage || err.error?.exceptionMessage || err.error?.message || err.error?.Message || 'Failed to delete package. Please try again.';
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: errorMessage
            });
          }
        });
      }
    });
  }
}
