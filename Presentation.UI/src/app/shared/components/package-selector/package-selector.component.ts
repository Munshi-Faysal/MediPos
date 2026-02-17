import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Package } from '../../../core/models/package.model';
import { PackageService } from '../../../core/services/package.service';

@Component({
  selector: 'app-package-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './package-selector.component.html',
  styleUrls: ['./package-selector.component.scss']
})
export class PackageSelectorComponent implements OnInit {
  private packageService = inject(PackageService);

  @Input() selectedPackageId = '';
  @Input() required = false;
  @Input() showDescription = true;
  @Output() packageSelected = new EventEmitter<Package>();

  packages: Package[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading = true;
    this.packageService.getActivePackages().subscribe({
      next: (packages) => {
        this.packages = packages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPackageChange(packageId: string): void {
    const selectedPackage = this.packages.find(p => p.id === packageId);
    if (selectedPackage) {
      this.packageSelected.emit(selectedPackage);
    }
  }

  getUserLimitDisplay(userLimit: number): string {
    if (userLimit === -1) {
      return 'Unlimited';
    }
    return `${userLimit} user${userLimit > 1 ? 's' : ''}`;
  }

  formatFeatureName(feature: string): string {
    return feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
