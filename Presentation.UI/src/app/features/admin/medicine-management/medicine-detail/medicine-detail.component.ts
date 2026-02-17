import { Component, OnInit, inject } from '@angular/core';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Medicine } from '../../../../core/models/medicine.model';
import { MedicineService } from '../../../../core/services/medicine.service';

@Component({
  selector: 'app-medicine-detail',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './medicine-detail.component.html',
  styleUrls: ['./medicine-detail.component.scss']
})
export class MedicineDetailComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  medicine: Medicine | null = null;
  loading = false;
  deleting = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadMedicine(params['id']);
      }
    });
  }

  loadMedicine(id: string): void {
    this.loading = true;
    this.medicineService.getMedicineById(id).subscribe({
      next: (medicine) => {
        this.medicine = medicine;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load medicine. Please try again.');
        this.router.navigate(['/admin/medicines']);
      }
    });
  }

  onEdit(): void {
    if (this.medicine) {
      this.router.navigate(['/admin/medicines', this.medicine.id, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.medicine) return;

    if (confirm(`Are you sure you want to delete ${this.medicine.medicineName}? This action cannot be undone.`)) {
      this.deleting = true;
      this.medicineService.deleteMedicine(this.medicine.id).subscribe({
        next: () => {
          this.deleting = false;
          this.router.navigate(['/admin/medicines']);
        },
        error: () => {
          this.deleting = false;
          alert('Failed to delete medicine. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
