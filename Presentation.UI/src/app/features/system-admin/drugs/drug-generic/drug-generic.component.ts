import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugGenericService } from '../../../../core/services/drug-generic.service';
import { DrugGeneric } from '../../../../core/models/drug-generic.model';

@Component({
    selector: 'app-drug-generic',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Generic Name Management</h1>
          <p class="text-on-surface-variant">Manage drug generic names and indications</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Generic
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search generics..."
            [(ngModel)]="searchQuery"
            (input)="filterGenerics()"
            class="w-full pl-10 pr-4 py-2 bg-surface-variant/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
    
        <!-- Data Table -->
        <div class="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-border">
                <th class="px-6 py-4">Generic Name</th>
                <th class="px-6 py-4">Indication</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (generic of filteredGenerics(); track generic) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ generic.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ generic.indication || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="generic.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ generic.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editGeneric(generic)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="deleteGeneric(generic.id)" class="text-rose-600 hover:text-rose-700 font-medium text-sm">Delete</button>
                  </td>
                </tr>
              }
              @if (filteredGenerics().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-10 text-center text-on-surface-variant">No records found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
    
        <!-- Modal -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingGeneric ? 'Edit' : 'Add New' }} Generic</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Generic Name</label>
                  <input type="text" [(ngModel)]="genericForm.name" placeholder="e.g. Paracetamol"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Indication</label>
                    <textarea [(ngModel)]="genericForm.indication" rows="2" placeholder="Primary usage..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Side Effects</label>
                    <textarea [(ngModel)]="genericForm.sideEffects" rows="2" placeholder="Potential side effects..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="genericForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                    <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                  </div>
                </div>
                <div class="flex gap-4 mt-8">
                  <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                  <button (click)="saveGeneric()" [disabled]="!genericForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
                </div>
              </div>
            </div>
          }
        </div>
    `,
    styles: [`
    :host { display: block; }
  `]
})
export class DrugGenericComponent implements OnInit {
    private genericService = inject(DrugGenericService);

    public generics = signal<DrugGeneric[]>([]);
    public filteredGenerics = signal<DrugGeneric[]>([]);
    public isModalOpen = signal(false);
    public searchQuery = '';
    public editingGeneric: DrugGeneric | null = null;
    public genericForm = { name: '', indication: '', sideEffects: '', isActive: true };

    ngOnInit(): void {
        this.loadGenerics();
    }

    filterGenerics(): void {
        if (!this.searchQuery.trim()) {
            this.filteredGenerics.set(this.generics());
        } else {
            const q = this.searchQuery.toLowerCase();
            this.filteredGenerics.set(this.generics().filter(d =>
                d.name.toLowerCase().includes(q) || (d.indication && d.indication.toLowerCase().includes(q))
            ));
        }
    }

    openModal(): void {
        this.editingGeneric = null;
        this.genericForm = { name: '', indication: '', sideEffects: '', isActive: true };
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    editGeneric(generic: DrugGeneric): void {
        this.editingGeneric = generic;
        this.genericForm = {
            name: generic.name,
            indication: generic.indication || '',
            sideEffects: generic.sideEffects || '',
            isActive: generic.isActive
        };
        this.isModalOpen.set(true);
    }

    saveGeneric(): void {
        if (this.editingGeneric) {
            this.genericService.updateGeneric({ ...this.editingGeneric, ...this.genericForm }).subscribe({
                next: () => {
                    this.loadGenerics();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error updating generic:', err);
                    alert('Failed to update generic. Please try again.');
                }
            });
        } else {
            this.genericService.addGeneric(this.genericForm).subscribe({
                next: () => {
                    this.loadGenerics();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error creating generic:', err);
                    alert('Failed to create generic. Please try again.');
                }
            });
        }
    }

    deleteGeneric(id: number): void {
        if (confirm('Are you sure you want to delete this generic?')) {
            const generic = this.generics().find(g => g.id === id);
            if (generic && (generic as any).encryptedId) {
                this.genericService.deleteGeneric((generic as any).encryptedId).subscribe({
                    next: () => {
                        this.loadGenerics();
                    },
                    error: (err) => {
                        console.error('Error deleting generic:', err);
                        alert('Failed to delete generic. Please try again.');
                    }
                });
            }
        }
    }

    loadGenerics(): void {
        this.genericService.getGenerics().subscribe({
            next: (data) => {
                this.generics.set(data);
                this.filterGenerics();
            },
            error: (err) => {
                console.error('Error loading generics:', err);
                this.generics.set([]);
                this.filterGenerics();
            }
        });
    }
}
