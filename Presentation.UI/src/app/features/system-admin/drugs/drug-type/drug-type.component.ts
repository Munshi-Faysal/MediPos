import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugTypeService, DrugTypeDto, DrugTypeViewModel } from '../../../../core/services/drug-type.service';

@Component({
    selector: 'app-drug-type',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Type Management</h1>
          <p class="text-on-surface-variant">Manage categories and types of drugs (Forms)</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Type
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search types..."
            [(ngModel)]="searchQuery"
            (input)="filterTypes()"
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
                <th class="px-6 py-4">Type Name</th>
                <th class="px-6 py-4">Common Usage</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (type of filteredTypes(); track type) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ type.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ type.description || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="type.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ type.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editType(type)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="toggleStatus(type)" [class]="type.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="font-medium text-sm">
                      {{ type.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
              @if (filteredTypes().length === 0) {
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
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingType ? 'Edit' : 'Add New' }} Drug Type</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Type Name</label>
                  <input type="text" [(ngModel)]="typeForm.name" placeholder="e.g. Tablet, Syrup, Injection"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Common Usage</label>
                    <textarea [(ngModel)]="typeForm.description" rows="3" placeholder="Oral administration, Intravenous..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="typeForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                    <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                  </div>
                </div>
                <div class="flex gap-4 mt-8">
                  <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                  <button (click)="saveType()" [disabled]="!typeForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugTypeComponent implements OnInit {
    private typeService = inject(DrugTypeService);

    public types = signal<any[]>([]);
    public filteredTypes = signal<any[]>([]);
    public isModalOpen = signal(false);
    public searchQuery = '';
    public editingType: any = null;
    public typeForm = { name: '', description: '', isActive: true };

    ngOnInit(): void {
        this.loadTypes();
    }

    loadTypes(): void {
        // Backend uses take/skip, not page/pageSize
        this.typeService.getDrugTypes({ page: 1, pageSize: 1000 } as any).subscribe({
            next: (response) => {
                // Handle ViewResponseViewModel structure
                const data = (response as any)?.data?.itemList || (response as any)?.data || [];
                const mapped = data.map((t: DrugTypeViewModel) => ({
                    id: t.encryptedId,
                    encryptedId: t.encryptedId,
                    name: t.name,
                    description: t.description || '',
                    isActive: t.isActive
                }));
                this.types.set(mapped);
                this.filterTypes();
            },
            error: (err) => {
                console.error('Error loading types:', err);
                this.types.set([]);
                this.filterTypes();
            }
        });
    }

    filterTypes(): void {
        if (!this.searchQuery.trim()) {
            this.filteredTypes.set(this.types());
        } else {
            const q = this.searchQuery.toLowerCase();
            this.filteredTypes.set(this.types().filter(d =>
                d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
            ));
        }
    }

    openModal(): void {
        this.editingType = null;
        this.typeForm = { name: '', description: '', isActive: true };
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    editType(type: any): void {
        this.editingType = type;
        this.typeForm = { ...type };
        this.isModalOpen.set(true);
    }

    saveType(): void {
        const dto: DrugTypeDto = {
            encryptedId: this.editingType?.encryptedId,
            name: this.typeForm.name,
            description: this.typeForm.description,
            displayOrder: 0,
            isActive: this.typeForm.isActive,
            doctorEncryptedId: undefined
        };

        if (this.editingType) {
            this.typeService.updateDrugType(dto).subscribe({
                next: () => {
                    this.loadTypes();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error updating type:', err);
                    alert('Failed to update type. Please try again.');
                }
            });
        } else {
            this.typeService.createDrugType(dto).subscribe({
                next: () => {
                    this.loadTypes();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error creating type:', err);
                    alert('Failed to create type. Please try again.');
                }
            });
        }
    }

    toggleStatus(type: any): void {
        if (type.encryptedId) {
            this.typeService.changeDrugTypeActiveStatus(type.encryptedId).subscribe({
                next: () => {
                    this.loadTypes();
                },
                error: (err) => {
                    console.error('Error toggling type status:', err);
                    alert('Failed to change status. Please try again.');
                }
            });
        }
    }
}
