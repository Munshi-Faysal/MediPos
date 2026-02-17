import { Component, signal, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-drug-dose',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Dose Management</h1>
          <p class="text-on-surface-variant">Manage drug dosages and frequencies</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Dose
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search doses..."
            [(ngModel)]="searchQuery"
            (input)="filterDoses()"
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
                <th class="px-6 py-4">Dose Name</th>
                <th class="px-6 py-4">Drug Type</th>
                <th class="px-6 py-4">Description</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (dose of filteredDoses(); track dose) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ dose.name }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded bg-surface-variant text-on-surface-variant text-[10px] font-bold uppercase">
                      {{ dose.drugType }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ dose.description || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="dose.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ dose.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editDose(dose)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="toggleStatus(dose)" [class]="dose.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="font-medium text-sm">
                      {{ dose.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
              @if (filteredDoses().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">No records found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
    
        <!-- Modal -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingDose ? 'Edit' : 'Add New' }} Drug Dose</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Dose Name</label>
                  <input type="text" [(ngModel)]="doseForm.name" placeholder="e.g. 1+0+1"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Drug Type</label>
                    <select [(ngModel)]="doseForm.drugType"
                      class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                      @for (type of drugTypes; track type) {
                        <option [value]="type">{{ type }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Description</label>
                    <textarea [(ngModel)]="doseForm.description" rows="3" placeholder="Additional details..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="doseForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                    <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                  </div>
                </div>
                <div class="flex gap-4 mt-8">
                  <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                  <button (click)="saveDose()" [disabled]="!doseForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugDoseComponent implements OnInit {
  public doses = signal<any[]>([]);
  public filteredDoses = signal<any[]>([]);
  public isModalOpen = signal(false);
  public searchQuery = '';
  public editingDose: any = null;
  public drugTypes = ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Suspension', 'Eye Drop', 'Ointment'];
  public doseForm = { name: '', description: '', drugType: 'Tablet', isActive: true };

  ngOnInit(): void {
    // Mock data for initial view
    this.doses.set([
      { id: 1, name: '1+0+1', drugType: 'Tablet', description: 'Morning and Night', isActive: true },
      { id: 2, name: '1+1+1', drugType: 'Tablet', description: 'Three times a day', isActive: true },
      { id: 3, name: '2 tsp', drugType: 'Syrup', description: 'Twice daily', isActive: true },
      { id: 4, name: '1+0+0', drugType: 'Capsule', description: 'Morning only', isActive: false },
    ]);
    this.filterDoses();
  }

  filterDoses(): void {
    if (!this.searchQuery.trim()) {
      this.filteredDoses.set(this.doses());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredDoses.set(this.doses().filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.drugType.toLowerCase().includes(q)
      ));
    }
  }

  openModal(): void {
    this.editingDose = null;
    this.doseForm = { name: '', description: '', drugType: 'Tablet', isActive: true };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editDose(dose: any): void {
    this.editingDose = dose;
    this.doseForm = { ...dose };
    this.isModalOpen.set(true);
  }

  saveDose(): void {
    if (this.editingDose) {
      const current = this.doses();
      const index = current.findIndex(d => d.id === this.editingDose.id);
      if (index !== -1) {
        current[index] = { ...this.editingDose, ...this.doseForm };
        this.doses.set([...current]);
      }
    } else {
      const newDose = {
        id: this.doses().length + 1,
        ...this.doseForm
      };
      this.doses.set([...this.doses(), newDose]);
    }
    this.filterDoses();
    this.closeModal();
  }

  toggleStatus(dose: any): void {
    const current = this.doses();
    const index = current.findIndex(d => d.id === dose.id);
    if (index !== -1) {
      current[index].isActive = !current[index].isActive;
      this.doses.set([...current]);
      this.filterDoses();
    }
  }
}
