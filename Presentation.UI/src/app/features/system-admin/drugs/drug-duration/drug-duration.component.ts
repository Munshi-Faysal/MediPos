import { Component, signal, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-drug-duration',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Duration Management</h1>
          <p class="text-on-surface-variant">Manage prescription durations</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Duration
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search durations..."
            [(ngModel)]="searchQuery"
            (input)="filterDurations()"
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
                <th class="px-6 py-4">Duration Name</th>
                <th class="px-6 py-4">Total Days</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (dur of filteredDurations(); track dur) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ dur.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ dur.days }} days</td>
                  <td class="px-6 py-4">
                    <span [class]="dur.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ dur.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editDuration(dur)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="toggleStatus(dur)" [class]="dur.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="font-medium text-sm">
                      {{ dur.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
              @if (filteredDurations().length === 0) {
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
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingDuration ? 'Edit' : 'Add New' }} Drug Duration</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Duration Name</label>
                  <input type="text" [(ngModel)]="durationForm.name" placeholder="e.g. 7 Days, 1 Month"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Total Days</label>
                    <input type="number" [(ngModel)]="durationForm.days"
                      class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    </div>
                    <div class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="durationForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                      <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                    </div>
                  </div>
                  <div class="flex gap-4 mt-8">
                    <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                    <button (click)="saveDuration()" [disabled]="!durationForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugDurationComponent implements OnInit {
    public durations = signal<any[]>([]);
    public filteredDurations = signal<any[]>([]);
    public isModalOpen = signal(false);
    public searchQuery = '';
    public editingDuration: any = null;
    public durationForm = { name: '', days: 1, isActive: true };

    ngOnInit(): void {
        this.durations.set([
            { id: 1, name: '7 Days', days: 7, isActive: true },
            { id: 2, name: '15 Days', days: 15, isActive: true },
            { id: 3, name: '1 Month', days: 30, isActive: true },
            { id: 4, name: '3 Months', days: 90, isActive: true },
            { id: 5, name: 'Continue', days: 0, isActive: true },
        ]);
        this.filterDurations();
    }

    filterDurations(): void {
        if (!this.searchQuery.trim()) {
            this.filteredDurations.set(this.durations());
        } else {
            const q = this.searchQuery.toLowerCase();
            this.filteredDurations.set(this.durations().filter(d =>
                d.name.toLowerCase().includes(q)
            ));
        }
    }

    openModal(): void {
        this.editingDuration = null;
        this.durationForm = { name: '', days: 1, isActive: true };
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    editDuration(dur: any): void {
        this.editingDuration = dur;
        this.durationForm = { ...dur };
        this.isModalOpen.set(true);
    }

    saveDuration(): void {
        if (this.editingDuration) {
            const current = this.durations();
            const index = current.findIndex(d => d.id === this.editingDuration.id);
            if (index !== -1) {
                current[index] = { ...this.editingDuration, ...this.durationForm };
                this.durations.set([...current]);
            }
        } else {
            const newDur = {
                id: this.durations().length + 1,
                ...this.durationForm
            };
            this.durations.set([...this.durations(), newDur]);
        }
        this.filterDurations();
        this.closeModal();
    }

    toggleStatus(dur: any): void {
        const current = this.durations();
        const index = current.findIndex(d => d.id === dur.id);
        if (index !== -1) {
            current[index].isActive = !current[index].isActive;
            this.durations.set([...current]);
            this.filterDurations();
        }
    }
}
