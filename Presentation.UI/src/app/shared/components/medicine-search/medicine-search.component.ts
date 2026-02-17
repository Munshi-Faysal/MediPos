import { Component, EventEmitter, Input, Output, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Medicine, DrugMaster, DrugDetail } from '../../../core/models/medicine.model';
import { MedicineService } from '../../../core/services/medicine.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medicine-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './medicine-search.component.html',
  styleUrls: ['./medicine-search.component.scss']
})
export class MedicineSearchComponent implements OnInit, OnDestroy {
  private medicineService = inject(MedicineService);

  @Input() showModal = false;
  @Output() medicineSelected = new EventEmitter<Medicine>();
  @Output() closeModal = new EventEmitter<void>();

  searchQuery = signal<string>('');
  drugMasters = signal<DrugMaster[]>([]);
  loading = signal<boolean>(false);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim().length < 2) {
          this.loading.set(false);
          return [];
        }
        this.loading.set(true);
        return this.medicineService.searchDrugMasters(term);
      })
    ).subscribe({
      next: (results) => {
        this.drugMasters.set(results);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectDetail(master: DrugMaster, detail: DrugDetail): void {
    // Construct a virtual Medicine object for compatibility with the prescription form
    const virtualMedicine: Medicine = {
      id: detail.encryptedId,
      medicineName: master.name, // Napa Extend
      genericName: master.drugGenericName,
      companyName: master.drugCompanyName,
      form: detail.drugTypeName as any, // Tab
      variation: detail.strengthName,  // 500mg
      pack: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.medicineSelected.emit(virtualMedicine);
    this.close();
  }

  close(): void {
    this.closeModal.emit();
    this.searchQuery.set('');
    this.drugMasters.set([]);
  }
}
