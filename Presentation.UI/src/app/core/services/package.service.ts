import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Package, PackageStatus } from '../models/package.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiService = inject(ApiService);

  // In-memory storage for demo
  private packagesSubject = new BehaviorSubject<Package[]>([]);
  public packages$ = this.packagesSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadPackages();
  }

  /**
   * Get all packages
   */
  getPackages(): Observable<Package[]> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<Package[]>('/api/packages').pipe(
      tap(packages => {
        this.packagesSubject.next(packages);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return this.packages$;
      })
    );
  }

  /**
   * Get package by ID
   */
  getPackageById(id: string): Observable<Package> {
    return this.apiService.get<Package>(`/api/packages/${id}`).pipe(
      catchError(() => {
        const packages = this.packagesSubject.value;
        const pkg = packages.find(p => p.id === id);
        if (pkg) {
          return of(pkg);
        }
        throw new Error('Package not found');
      })
    );
  }

  /**
   * Create new package
   */
  createPackage(pkg: Package): Observable<Package> {
    this.loadingSubject.next(true);
    
    const newPackage: Package = {
      ...pkg,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.apiService.post<Package>('/api/packages', newPackage).pipe(
      tap(createdPackage => {
        const current = this.packagesSubject.value;
        this.packagesSubject.next([...current, createdPackage]);
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.packagesSubject.value;
        this.packagesSubject.next([...current, newPackage]);
        this.loadingSubject.next(false);
        return of(newPackage);
      })
    );
  }

  /**
   * Update existing package
   */
  updatePackage(id: string, pkg: Package): Observable<Package> {
    this.loadingSubject.next(true);
    
    const updatedPackage: Package = {
      ...pkg,
      id,
      updatedAt: new Date()
    };

    return this.apiService.put<Package>(`/api/packages/${id}`, updatedPackage).pipe(
      tap(updated => {
        const current = this.packagesSubject.value;
        const index = current.findIndex(p => p.id === id);
        if (index !== -1) {
          current[index] = updated;
          this.packagesSubject.next([...current]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.packagesSubject.value;
        const index = current.findIndex(p => p.id === id);
        if (index !== -1) {
          current[index] = updatedPackage;
          this.packagesSubject.next([...current]);
        }
        this.loadingSubject.next(false);
        return of(updatedPackage);
      })
    );
  }

  /**
   * Delete package
   */
  deletePackage(id: string): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<void>(`/api/packages/${id}`).pipe(
      tap(() => {
        const current = this.packagesSubject.value;
        this.packagesSubject.next(current.filter(p => p.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(() => {
        const current = this.packagesSubject.value;
        this.packagesSubject.next(current.filter(p => p.id !== id));
        this.loadingSubject.next(false);
        return of(void 0);
      })
    );
  }

  /**
   * Get active packages
   */
  getActivePackages(): Observable<Package[]> {
    const packages = this.packagesSubject.value;
    return of(packages.filter(p => p.status === PackageStatus.ACTIVE));
  }

  /**
   * Get package by user limit
   */
  getPackageByUserLimit(userLimit: number): Observable<Package | null> {
    const packages = this.packagesSubject.value;
    const pkg = packages.find(p => p.userLimit === userLimit && p.status === PackageStatus.ACTIVE);
    return of(pkg || null);
  }

  /**
   * Get available packages (for selection)
   */
  getAvailablePackages(): Observable<Package[]> {
    return this.getActivePackages();
  }

  /**
   * Check if package supports feature
   */
  packageSupportsFeature(packageId: string, feature: string): Observable<boolean> {
    return this.getPackageById(packageId).pipe(
      map((pkg: Package | undefined) => {
        if (!pkg) return false;
        return pkg.features.includes(feature);
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Load packages (initialize or refresh)
   */
  private loadPackages(): void {
    // Initialize with default packages for demo
    const defaultPackages: Package[] = [
      {
        id: 'pkg_1',
        packageName: 'Single User Package',
        userLimit: 1,
        features: ['medicine_management', 'prescription_creation', 'patient_management'],
        price: 29.99,
        status: PackageStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pkg_5',
        packageName: 'Small Team Package',
        userLimit: 5,
        features: [
          'medicine_management',
          'doctor_management',
          'prescription_creation',
          'prescription_monitoring',
          'patient_management'
        ],
        price: 79.99,
        status: PackageStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pkg_15',
        packageName: 'Medium Team Package',
        userLimit: 15,
        features: [
          'medicine_management',
          'doctor_management',
          'prescription_creation',
          'prescription_monitoring',
          'patient_management',
          'reporting',
          'analytics'
        ],
        price: 199.99,
        status: PackageStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pkg_unlimited',
        packageName: 'Enterprise Package',
        userLimit: -1, // Unlimited
        features: [
          'medicine_management',
          'doctor_management',
          'prescription_creation',
          'prescription_monitoring',
          'patient_management',
          'reporting',
          'analytics',
          'api_access',
          'priority_support'
        ],
        price: 499.99,
        status: PackageStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.packagesSubject.next(defaultPackages);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
