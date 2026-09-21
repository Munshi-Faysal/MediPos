import { Component, signal, OnInit, inject, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DrugCompanyService } from '../../../../core/services/drug-company.service';
import { DrugCompany } from '../../../../core/models/drug-company.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-drug-company',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-on-surface">Drug Company Management</h1>
          <p class="text-on-surface-variant">Manage pharmaceutical companies</p>
        </div>
        @if (isSuperAdmin()) {
          <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md">
            Add New Company
          </button>
        }
      </div>
    
      <!-- Search and Filter -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-soft">
        <div class="relative max-w-md">
          <input
            type="text"
            placeholder="Search companies..."
            [(ngModel)]="searchQuery"
            (input)="filterCompanies()"
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
                <th class="px-6 py-4">Company Name</th>
                <th class="px-6 py-4">Description</th>
                <th class="px-6 py-4">Status</th>
                @if (isSuperAdmin()) {
                  <th class="px-6 py-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (company of filteredCompanies(); track company) {
                <tr class="hover:bg-surface-variant/20 transition-colors">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ company.name }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ company.description || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="company.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                      {{ company.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  @if (isSuperAdmin()) {
                    <td class="px-6 py-4 text-right space-x-2">
                      <button (click)="editCompany(company)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">Edit</button>
                      <button (click)="deleteCompany(company.id)" class="text-rose-600 hover:text-rose-700 font-medium text-sm">Delete</button>
                    </td>
                  }
                </tr>
              }
              @if (filteredCompanies().length === 0) {
                <tr>
                  <td [attr.colspan]="isSuperAdmin() ? 4 : 3" class="px-6 py-10 text-center text-on-surface-variant">No records found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
    
        <!-- Modal -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-surface border border-border rounded-2xl shadow-strong max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
              <h2 class="text-2xl font-bold text-on-surface mb-6">{{ editingCompany ? 'Edit' : 'Add New' }} Company</h2>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Company Name</label>
                  <input type="text" [(ngModel)]="companyForm.name" placeholder="e.g. Square Pharmaceuticals"
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Description</label>
                    <textarea [(ngModel)]="companyForm.description" rows="3" placeholder="Description of the company..."
                    class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-on-surface-variant mb-1 block">Display Order</label>
                    <input type="number" [(ngModel)]="companyForm.displayOrder"
                      class="w-full px-4 py-2 bg-surface-variant/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    </div>
                    <div class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="companyForm.isActive" id="isActive" class="w-4 h-4 rounded text-primary-600">
                      <label for="isActive" class="text-sm font-medium text-on-surface">Active</label>
                    </div>
                  </div>
                  <div class="flex gap-4 mt-8">
                    <button (click)="closeModal()" class="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-surface-variant transition-all">Cancel</button>
                    <button (click)="saveCompany()" [disabled]="!companyForm.name" class="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md">Save</button>
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
export class DrugCompanyComponent implements OnInit {
  private companyService = inject(DrugCompanyService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  public isSuperAdmin = computed(() => this.authService.isSuperAdmin());
  public companies = signal<DrugCompany[]>([]);
  public filteredCompanies = signal<DrugCompany[]>([]);
  public isModalOpen = signal(false);
  public searchQuery = '';
  public editingCompany: DrugCompany | null = null;
  public companyForm = { name: '', description: '', isActive: true, displayOrder: 0 };

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompaniesList().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.filterCompanies();
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.companies.set([]);
        this.filterCompanies();
      }
    });
  }

  filterCompanies(): void {
    const currentSearchQuery = this.searchQuery.trim();
    if (!currentSearchQuery) {
      this.filteredCompanies.set(this.companies());
    } else {
      const q = currentSearchQuery.toLowerCase();
      this.filteredCompanies.set(this.companies().filter(d =>
        d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q))
      ));
    }
  }

  openModal(): void {
    if (!this.isSuperAdmin()) return;
    this.editingCompany = null;
    this.companyForm = { name: '', description: '', isActive: true, displayOrder: 0 };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editCompany(company: DrugCompany): void {
    if (!this.isSuperAdmin()) return;
    this.editingCompany = company;
    this.companyForm = {
      name: company.name,
      description: company.description || '',
      isActive: company.isActive,
      displayOrder: company.displayOrder || 0
    };
    this.isModalOpen.set(true);
  }

  saveCompany(): void {
    if (!this.isSuperAdmin()) return;
    if (this.editingCompany) {
      this.companyService.updateCompany({ ...this.editingCompany, ...this.companyForm }).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Company updated successfully');
          this.loadCompanies();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating company:', err);
          const errorMessage = err.error?.ExceptionMessage || err.error?.exceptionMessage || err.error?.message || err.error?.Message || 'Failed to update company. Please try again.';
          this.notificationService.error('Update Failed', errorMessage);
        }
      });
    } else {
      this.companyService.addCompany(this.companyForm).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Company created successfully');
          this.loadCompanies();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating company:', err);
          const errorMessage = err.error?.ExceptionMessage || err.error?.exceptionMessage || err.error?.message || err.error?.Message || 'Failed to create company. Please try again.';
          this.notificationService.error('Creation Failed', errorMessage);
        }
      });
    }
  }

  deleteCompany(id: number): void {
    if (!this.isSuperAdmin()) return;
    const company = this.companies().find(c => c.id === id);
    if (!company || !(company as any).encryptedId) return;

    Swal.fire({
      title: 'Delete Company?',
      text: `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
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
        this.companyService.deleteCompany((company as any).encryptedId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Company "${company.name}" has been deleted.`,
              timer: 2000,
              showConfirmButton: false
            });
            this.loadCompanies();
          },
          error: (err) => {
            console.error('Error deleting company:', err);
            const errorMessage = err.error?.ExceptionMessage || err.error?.exceptionMessage || err.error?.message || err.error?.Message || 'Failed to delete company. Please try again.';
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
