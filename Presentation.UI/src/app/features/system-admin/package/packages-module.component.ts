import { Component, OnInit, signal, computed, inject } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SystemPackageService } from '../../../core/services/system-package.service';
import { Feature, Package, PackageFeature } from '../../../core/models/system-package.model';
import { NotificationService } from '../../../core/services/notification.service';

type ModalType = 'package' | 'feature' | 'packageFeature' | null;

@Component({
  selector: 'app-packages-module',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div class="max-w-[1600px] mx-auto space-y-6 animate-fade-in">
    
        <!-- Header Section -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Package Management System
              </h1>
              <p class="text-slate-600 mt-2 text-lg">Manage Packages, Features & Relationships</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-bold shadow-lg">
                <span class="text-sm opacity-80">Total Packages:</span>
                <span class="text-2xl ml-2">{{ allPackages().length }}</span>
              </div>
              <div class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold shadow-lg">
                <span class="text-sm opacity-80">Total Features:</span>
                <span class="text-2xl ml-2">{{ allFeatures().length }}</span>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
    
          <!-- FEATURES TABLE -->
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-black text-white flex items-center gap-2">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Features
                  </h2>
                  <p class="text-emerald-100 text-sm mt-1">{{ allFeatures().length }} total features</p>
                </div>
                <button
                  (click)="openModal('feature')"
                  class="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                  >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>
    
            <div class="p-4 flex-1 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
              <div class="space-y-3">
                @for (feature of allFeatures(); track feature) {
                  <div
                    class="group bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 rounded-2xl p-4 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
                    >
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <h3 class="font-black text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                          {{ feature.name }}
                        </h3>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ feature.description || 'No description' }}</p>
                      </div>
                      <span
                        class="px-2 py-1 rounded-lg text-xs font-bold uppercase"
                        [class]="feature.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                        >
                        {{ feature.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-100">
                      <button
                        (click)="editFeature(feature)"
                        class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        (click)="toggleFeatureStatus(feature)"
                        class="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        {{ feature.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                    </div>
                  </div>
                }
    
                @if (allFeatures().length === 0) {
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p class="text-slate-500 font-medium">No features yet</p>
                  </div>
                }
              </div>
            </div>
          </div>
    
          <!-- PACKAGES TABLE -->
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-black text-white flex items-center gap-2">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    Packages
                  </h2>
                  <p class="text-indigo-100 text-sm mt-1">{{ allPackages().length }} total packages</p>
                </div>
                <button
                  (click)="openModal('package')"
                  class="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                  >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Package
                </button>
              </div>
            </div>
    
            <div class="p-4 flex-1 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100">
              <div class="space-y-3">
                @for (pkg of allPackages(); track pkg) {
                  <div
                    class="group bg-gradient-to-br from-white to-indigo-50/30 border-2 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer"
                    [class.border-amber-400]="pkg.isPopular"
                    [class.border-indigo-100]="!pkg.isPopular"
                    [class.hover:border-indigo-400]="!pkg.isPopular"
                    >
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h3 class="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {{ pkg.name }}
                          </h3>
                          @if (pkg.isPopular) {
                            <span class="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase rounded-full">
                              Popular
                            </span>
                          }
                        </div>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ pkg.description || 'No description' }}</p>
                      </div>
                      <span
                        class="px-2 py-1 rounded-lg text-xs font-bold uppercase"
                        [class]="pkg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                        >
                        {{ pkg.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 my-3">
                      <div class="flex-1 bg-indigo-50 rounded-xl p-2 text-center">
                        <p class="text-2xl font-black text-indigo-600">\${{ pkg.price }}</p>
                        <p class="text-[10px] text-slate-500 font-bold uppercase">Price</p>
                      </div>
                      <div class="flex-1 bg-purple-50 rounded-xl p-2 text-center">
                        <p class="text-2xl font-black text-purple-600">{{ pkg.duration }}</p>
                        <p class="text-[10px] text-slate-500 font-bold uppercase">Duration</p>
                      </div>
                      <!-- User Limit not in API model yet
                      <div class="flex-1 bg-pink-50 rounded-xl p-2 text-center">
                        <p class="text-2xl font-black text-pink-600">{{ pkg.userLimit === -1 ? '∞' : pkg.userLimit }}</p>
                        <p class="text-[10px] text-slate-500 font-bold uppercase">Users</p>
                      </div>
                      -->
                    </div>
                    @if (pkg.featureList && pkg.featureList.length > 0) {
                      <div class="mb-3 px-1">
                        <p class="text-[10px] uppercase font-bold text-slate-400 mb-1">Includes:</p>
                        <div class="flex flex-wrap gap-1.5">
                          @for (feat of (expandedPackages().includes(pkg.encryptedId || '') ? pkg.featureList : pkg.featureList.slice(0, 5)); track feat) {
                            <span class="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-md shadow-sm">
                              {{ feat }}
                            </span>
                          }
                          @if (pkg.featureList.length > 5 && !expandedPackages().includes(pkg.encryptedId || '')) {
                            <button
                              (click)="togglePackageExpansion(pkg.encryptedId || '', $event)"
                              class="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                              >
                              +{{ pkg.featureList.length - 5 }} More
                            </button>
                          }
                          @if (pkg.featureList.length > 5 && expandedPackages().includes(pkg.encryptedId || '')) {
                            <button
                              (click)="togglePackageExpansion(pkg.encryptedId || '', $event)"
                              class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                              >
                              Show Less
                            </button>
                          }
                        </div>
                      </div>
                    }
                    <div class="flex items-center gap-2 pt-3 border-t border-indigo-100">
                      <button
                        (click)="editPackage(pkg)"
                        class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        (click)="togglePackageStatus(pkg)"
                        class="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        {{ pkg.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                    </div>
                  </div>
                }
    
                @if (allPackages().length === 0) {
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <p class="text-slate-500 font-medium">No packages yet</p>
                  </div>
                }
              </div>
            </div>
          </div>
    
    
    
          <!-- Feature Modal -->
          @if (activeModal() === 'feature') {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" (click)="closeModal()">
              <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slide-up" (click)="$event.stopPropagation()">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-3xl">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-black text-white">{{ editingFeature ? 'Edit Feature' : 'Create Feature' }}</h3>
                    <button (click)="closeModal()" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <form [formGroup]="featureForm" class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-black text-slate-700 mb-2">Feature Name *</label>
                    <input
                      type="text"
                      formControlName="name"
                      class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                      placeholder="e.g. Advanced Analytics"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-black text-slate-700 mb-2">Description</label>
                      <textarea
                        formControlName="description"
                        rows="3"
                        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium resize-none"
                        placeholder="Describe this feature..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                      <label class="flex items-center gap-3 cursor-pointer group">
                        <div class="relative">
                          <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                          <div class="w-12 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-all duration-300"></div>
                          <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-md"></div>
                        </div>
                        <span class="text-sm font-bold text-slate-700">Is Active</span>
                      </label>
                    </div>
                  </form>
                  <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button (click)="closeModal()" class="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">
                      Cancel
                    </button>
                    <button
                      (click)="saveFeature()"
                      [disabled]="featureForm.invalid || isSubmitting()"
                      class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                      {{ editingFeature ? 'Update' : 'Create' }} Feature
                    </button>
                  </div>
                </div>
              </div>
            }
    
            <!-- Package Modal -->
            @if (activeModal() === 'package') {
              <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" (click)="closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" (click)="$event.stopPropagation()">
                  <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-3xl">
                    <div class="flex items-center justify-between">
                      <h3 class="text-2xl font-black text-white">{{ editingPackage ? 'Edit Package' : 'Create Package' }}</h3>
                      <button (click)="closeModal()" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <form [formGroup]="packageForm" class="p-6 space-y-4 overflow-y-auto flex-1">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-black text-slate-700 mb-2">Package Name *</label>
                        <input
                          type="text"
                          formControlName="name"
                          class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                          placeholder="e.g. Premium Plus"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-black text-slate-700 mb-2">Price (USD) *</label>
                          <input
                            type="number"
                            formControlName="price"
                            class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                            placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-black text-slate-700 mb-2">Description</label>
                          <textarea
                            formControlName="description"
                            rows="2"
                            class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                            placeholder="Brief summary..."
                          ></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-black text-slate-700 mb-2">Duration (e.g. 30 Days) *</label>
                            <input
                              type="text"
                              formControlName="duration"
                              class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                              placeholder="30 Days"
                              />
                            </div>
                          </div>
                          <!-- Feature Selection inside Package Modal directly -->
                          <div>
                            <div class="flex items-center justify-between mb-3">
                              <label class="block text-sm font-black text-slate-700">Select Features *</label>
                              <button
                                type="button"
                                (click)="toggleSelectAllFeatures()"
                                class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                {{ selectedFeatureIds().length === allFeatures().length ? 'Deselect All' : 'Select All' }}
                              </button>
                            </div>
                            <div class="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto p-2 bg-slate-50 rounded-xl">
                              @for (feat of allFeatures(); track feat) {
                                <label
                                  class="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-pink-400 transition-all"
                                  [class.border-pink-500]="selectedFeatureIds().includes(feat.encryptedId || '')"
                                  [class.bg-pink-50]="selectedFeatureIds().includes(feat.encryptedId || '')"
                                  >
                                  <input
                                    type="checkbox"
                                    [checked]="selectedFeatureIds().includes(feat.encryptedId || '')"
                                    (change)="toggleFeatureSelection(feat.encryptedId || '')"
                                    class="w-5 h-5 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                                    />
                                    <div class="flex-1">
                                      <p class="text-sm font-bold text-slate-700">{{ feat.name }}</p>
                                    </div>
                                  </label>
                                }
                              </div>
                            </div>
                            <div class="flex items-center gap-6 p-4 bg-indigo-50 rounded-xl">
                              <label class="flex items-center gap-3 cursor-pointer">
                                <div class="relative">
                                  <input type="checkbox" formControlName="isPopular" class="sr-only peer" />
                                  <div class="w-12 h-6 bg-slate-300 peer-checked:bg-amber-500 rounded-full transition-all duration-300"></div>
                                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-md"></div>
                                </div>
                                <span class="text-sm font-bold text-slate-700">Popular</span>
                              </label>
                              <label class="flex items-center gap-3 cursor-pointer">
                                <div class="relative">
                                  <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                                  <div class="w-12 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-all duration-300"></div>
                                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-md"></div>
                                </div>
                                <span class="text-sm font-bold text-slate-700">Is Active</span>
                              </label>
                            </div>
                          </form>
                          <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button (click)="closeModal()" class="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">
                              Cancel
                            </button>
                            <button
                              (click)="savePackage()"
                              [disabled]="packageForm.invalid || isSubmitting()"
                              class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                              >
                              {{ editingPackage ? 'Update' : 'Create' }} Package
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
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
    .scrollbar-thumb-indigo-400::-webkit-scrollbar-thumb {
      background-color: rgb(129 140 248);
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
}
