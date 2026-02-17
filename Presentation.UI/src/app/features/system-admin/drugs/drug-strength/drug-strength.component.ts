import { Component, signal, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugStrengthService, DrugStrengthDto, DrugStrengthViewModel, DropdownItem } from '../../../../core/services/drug-strength.service';

@Component({
  selector: 'app-drug-strength',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Strength Management</h1>
          <p class="text-on-surface-variant">Manage potency and strengths of drugs</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Strength
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search strengths..."
            [(ngModel)]="searchQuery"
            (input)="filterStrengths()"
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
                <th class="px-6 py-4">Strength</th>
                <th class="px-6 py-4">Unit</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (str of filteredStrengths(); track str) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ str.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ str.unit }}</td>
                  <td class="px-6 py-4">
                    <span [class]="str.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ str.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editStrength(str)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="toggleStatus(str)" [class]="str.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="font-medium text-sm">
                      {{ str.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
              @if (filteredStrengths().length === 0) {
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
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingStrength ? 'Edit' : 'Add New' }} Drug Strength</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Strength (Value)</label>
                  <input type="text" [(ngModel)]="strengthForm.name" placeholder="e.g. 500"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Unit</label>
                    <select [(ngModel)]="strengthForm.unitEncryptedId"
                      class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                      <option value="" disabled>Select Unit</option>
                      @for (u of units(); track u) {
                        <option [value]="u.id">{{ u.value }}</option>
                      }
                    </select>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="strengthForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                    <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                  </div>
                </div>
                <div class="flex gap-4 mt-8">
                  <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                  <button (click)="saveStrength()" [disabled]="!strengthForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugStrengthComponent implements OnInit {
  private strengthService = inject(DrugStrengthService);

  public strengths = signal<any[]>([]);
  public filteredStrengths = signal<any[]>([]);
  public units = signal<DropdownItem[]>([]);
  public isModalOpen = signal(false);
  public searchQuery = '';
  public editingStrength: any = null;
  public strengthForm = { name: '', unitEncryptedId: '', isActive: true };

  ngOnInit(): void {
    this.loadUnits();
    this.loadStrengths();
  }

  loadUnits(): void {
    this.strengthService.getInitObject().subscribe({
      next: (res: any) => {
        this.units.set(res.unitList || []);
      },
      error: (err) => console.error('Error loading units:', err)
    });
  }

  loadStrengths(): void {
    // Backend uses take/skip, not page/pageSize
    this.strengthService.getDrugStrengths({ page: 1, pageSize: 1000 } as any).subscribe({
      next: (response) => {
        // Handle ViewResponseViewModel structure
        const data = (response as any)?.data?.itemList || (response as any)?.data || [];
        const mapped = data.map((s: DrugStrengthViewModel) => ({
          id: s.encryptedId,
          encryptedId: s.encryptedId,
          name: s.quantity || '',
          unit: s.unitName || 'mg',
          isActive: s.isActive
        }));
        this.strengths.set(mapped);
        this.filterStrengths();
      },
      error: (err) => {
        console.error('Error loading strengths:', err);
        this.strengths.set([]);
        this.filterStrengths();
      }
    });
  }

  filterStrengths(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStrengths.set(this.strengths());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredStrengths.set(this.strengths().filter(d =>
        d.name.toLowerCase().includes(q) || d.unit.toLowerCase().includes(q)
      ));
    }
  }

  openModal(): void {
    this.editingStrength = null;
    this.strengthForm = { name: '', unitEncryptedId: '', isActive: true };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editStrength(str: any): void {
    this.editingStrength = str;
    // Find unit ID by name as we don't have it in the view model
    const foundUnit = this.units().find(u => u.value === str.unit);
    this.strengthForm = {
      name: str.name,
      unitEncryptedId: foundUnit?.id || '',
      isActive: str.isActive
    };
    this.isModalOpen.set(true);
  }

  saveStrength(): void {
    const dto: DrugStrengthDto = {
      encryptedId: this.editingStrength?.encryptedId,
      quantity: this.strengthForm.name,
      unitEncryptedId: this.strengthForm.unitEncryptedId,
      isActive: this.strengthForm.isActive,
      doctorEncryptedId: undefined
    };

    if (this.editingStrength) {
      this.strengthService.updateDrugStrength(dto).subscribe({
        next: () => {
          this.loadStrengths();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating strength:', err);
          alert('Failed to update strength. Please try again.');
        }
      });
    } else {
      this.strengthService.createDrugStrength(dto).subscribe({
        next: () => {
          this.loadStrengths();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating strength:', err);
          alert('Failed to create strength. Please try again.');
        }
      });
    }
  }

  toggleStatus(str: any): void {
    if (str.encryptedId) {
      this.strengthService.changeDrugStrengthActiveStatus(str.encryptedId).subscribe({
        next: () => {
          this.loadStrengths();
        },
        error: (err) => {
          console.error('Error toggling strength status:', err);
          alert('Failed to change status. Please try again.');
        }
      });
    }
  }
}
