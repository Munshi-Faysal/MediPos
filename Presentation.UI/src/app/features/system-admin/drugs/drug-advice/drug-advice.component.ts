import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrugAdviceService, DrugAdviceViewModel, DrugAdviceDto } from '../../../../core/services/drug-advice.service';

@Component({
  selector: 'app-drug-advice',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Advice Management</h1>
          <p class="text-on-surface-variant">Manage instructions and advice for medication</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
          Add New Advice
        </button>
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search advice..."
            [(ngModel)]="searchQuery"
            (input)="filterAdvice()"
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
                <th class="px-6 py-4">Advice Name</th>
                <th class="px-6 py-4">Full Instruction</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (adv of filteredAdvice(); track adv) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ adv.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ adv.description || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="adv.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ adv.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button (click)="editAdvice(adv)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                    <button (click)="toggleStatus(adv)" [class]="adv.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="font-medium text-sm">
                      {{ adv.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
              @if (filteredAdvice().length === 0) {
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
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingAdvice ? 'Edit' : 'Add New' }} Drug Advice</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Advice Name</label>
                  <input type="text" [(ngModel)]="adviceForm.name" placeholder="e.g. Empty Stomach"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Instruction</label>
                    <textarea [(ngModel)]="adviceForm.description" rows="3" placeholder="Take on an empty stomach 30 mins before meal..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="adviceForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                    <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                  </div>
                </div>
                <div class="flex gap-4 mt-8">
                  <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                  <button (click)="saveAdvice()" [disabled]="!adviceForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugAdviceComponent implements OnInit {
  private service = inject(DrugAdviceService);
  public advices = signal<DrugAdviceViewModel[]>([]);
  public filteredAdvice = signal<DrugAdviceViewModel[]>([]);
  public isModalOpen = signal(false);
  public searchQuery = '';
  public editingAdvice: DrugAdviceViewModel | null = null;
  public adviceForm = { name: '', description: '', isActive: true };

  ngOnInit(): void {
    this.loadAdvices();
  }

  loadAdvices(): void {
    this.service.getDrugAdvices({ page: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.advices.set(res.data.itemList);
          this.filterAdvice();
        }
      },
      error: (err) => console.error('Error loading advices', err)
    });
  }

  filterAdvice(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAdvice.set(this.advices());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredAdvice.set(this.advices().filter(d =>
        d.name?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
      ));
    }
  }

  openModal(): void {
    this.editingAdvice = null;
    this.adviceForm = { name: '', description: '', isActive: true };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editAdvice(adv: DrugAdviceViewModel): void {
    this.editingAdvice = adv;
    this.adviceForm = {
      name: adv.name,
      description: adv.description || '',
      isActive: adv.isActive
    };
    this.isModalOpen.set(true);
  }

  saveAdvice(): void {
    if (this.editingAdvice) {
      const dto: DrugAdviceDto = {
        encryptedId: this.editingAdvice.encryptedId,
        name: this.adviceForm.name,
        description: this.adviceForm.description,
        isActive: this.adviceForm.isActive,
        displayOrder: this.editingAdvice.displayOrder
      };
      this.service.updateDrugAdvice(dto).subscribe({
        next: () => {
          this.loadAdvices();
          this.closeModal();
        },
        error: (err) => console.error('Error updating advice', err)
      });
    } else {
      const dto: DrugAdviceDto = {
        name: this.adviceForm.name,
        description: this.adviceForm.description,
        isActive: this.adviceForm.isActive,
        displayOrder: 0
      };
      this.service.createDrugAdvice(dto).subscribe({
        next: () => {
          this.loadAdvices();
          this.closeModal();
        },
        error: (err) => console.error('Error creating advice', err)
      });
    }
  }

  toggleStatus(adv: DrugAdviceViewModel): void {
    this.service.changeDrugAdviceActiveStatus(adv.encryptedId).subscribe({
      next: () => {
        // Optimistic update or reload
        const current = this.advices();
        const index = current.findIndex(d => d.encryptedId === adv.encryptedId);
        if (index !== -1) {
          // clone the array and item to trigger signal update
          const updated = [...current];
          updated[index] = { ...updated[index], isActive: !updated[index].isActive };
          this.advices.set(updated);
          this.filterAdvice();
        }
      },
      error: (err) => console.error('Error toggling status', err)
    });
  }
}
