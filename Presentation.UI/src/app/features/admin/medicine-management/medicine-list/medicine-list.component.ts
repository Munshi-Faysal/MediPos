import { Component, OnInit, signal, computed, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Medicine, MedicineForm, MedicineFilters } from '../../../../core/models/medicine.model';
import { MedicineService } from '../../../../core/services/medicine.service';
import { DynamicTableComponent, TableColumn } from '../../../../shared/components/dynamic-table/dynamic-table.component';
import { TableData } from '../../../../shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [RouterModule, FormsModule, DynamicTableComponent],
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.scss']
})
export class MedicineListComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private router = inject(Router);

  medicines = signal<Medicine[]>([]);
  filteredMedicines = signal<Medicine[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');
  
  // Filter states
  selectedForm = signal<MedicineForm | ''>('');
  selectedCategory = signal<string>('');
  selectedCompany = signal<string>('');

  // Table columns
  columns: TableColumn[] = [
    { key: 'sl', title: 'SL', sortable: false, width: '80px' },
    { key: 'genericName', title: 'Generic Name', sortable: true },
    { key: 'companyName', title: 'Company', sortable: true },
    { key: 'medicineName', title: 'Brand Name', sortable: true },
    { key: 'variation', title: 'Strength', sortable: false },
    { key: 'form', title: 'Form', sortable: true },
    { key: 'pack', title: 'Pack', sortable: false },
    { key: 'category', title: 'Category', sortable: true },
    { key: 'price', title: 'Price', sortable: true, align: 'right' },
    { key: 'actions', title: 'Actions', sortable: false, width: '120px' }
  ];

  // Available filters
  medicineForms = Object.values(MedicineForm);
  categories = signal<string[]>([]);
  companies = signal<string[]>([]);

  ngOnInit(): void {
    this.loadMedicines();
    this.medicineService.medicines$.subscribe(medicines => {
      this.medicines.set(medicines);
      this.updateFilters();
      this.applyFilters();
    });
  }

  loadMedicines(): void {
    this.loading.set(true);
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines.set(medicines);
        this.updateFilters();
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateFilters(): void {
    const medicines = this.medicines();
    const uniqueCategories = [...new Set(medicines.map(m => m.category).filter(Boolean))] as string[];
    const uniqueCompanies = [...new Set(medicines.map(m => m.companyName))];
    this.categories.set(uniqueCategories);
    this.companies.set(uniqueCompanies);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onFormFilterChange(form: MedicineForm | ''): void {
    this.selectedForm.set(form);
    this.applyFilters();
  }

  onCategoryFilterChange(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  onCompanyFilterChange(company: string): void {
    this.selectedCompany.set(company);
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: MedicineFilters = {
      search: this.searchQuery(),
      form: this.selectedForm() || undefined,
      category: this.selectedCategory() || undefined,
      companyName: this.selectedCompany() || undefined
    };

    this.medicineService.filterMedicines(filters).subscribe({
      next: (filtered) => {
        this.filteredMedicines.set(filtered);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedForm.set('');
    this.selectedCategory.set('');
    this.selectedCompany.set('');
    this.applyFilters();
  }

  getTableData(): TableData[] {
    return this.filteredMedicines().map((medicine, index) => ({
      sl: index + 1,
      id: medicine.id,
      genericName: medicine.genericName,
      companyName: medicine.companyName,
      medicineName: medicine.medicineName,
      variation: medicine.variation,
      form: medicine.form,
      pack: medicine.pack,
      category: medicine.category || '-',
      price: medicine.price ? `$${medicine.price.toFixed(2)}` : '-',
      _medicine: medicine // Store full object for actions
    }));
  }

  onRowClick(row: TableData): void {
    const medicine = row['_medicine'] as Medicine;
    if (medicine) {
      // Navigate to detail page
      this.router.navigate(['/admin/medicines', medicine.id]);
    }
  }

  onEdit(medicine: Medicine): void {
    this.router.navigate(['/admin/medicines', medicine.id, 'edit']);
  }

  onDelete(medicine: Medicine): void {
    if (confirm(`Are you sure you want to delete ${medicine.medicineName}?`)) {
      this.medicineService.deleteMedicine(medicine.id).subscribe({
        next: () => {
          this.loadMedicines();
        },
        error: (error) => {
          console.error('Error deleting medicine:', error);
          alert('Failed to delete medicine. Please try again.');
        }
      });
    }
  }
}
