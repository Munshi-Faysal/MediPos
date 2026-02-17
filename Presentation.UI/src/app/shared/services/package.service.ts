import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Package } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private packages$ = new BehaviorSubject<Package[]>([]);
  private currentPackage$ = new BehaviorSubject<Package | null>(null);

  constructor() {
    // Initialize with empty array or load from storage
  }

  getPackages(): Observable<Package[]> {
    return this.packages$.asObservable();
  }

  getPackageById(id: string): Observable<Package | undefined> {
    const packages = this.packages$.value;
    const pkg = packages.find(p => p.id === id);
    return of(pkg);
  }

  createPackage(pkg: Package): Observable<Package> {
    const current = this.packages$.value;
    const updated = [...current, pkg];
    this.packages$.next(updated);
    return of(pkg);
  }

  updatePackage(id: string, pkg: Package): Observable<Package> {
    const current = this.packages$.value;
    const updated = current.map(p => p.id === id ? pkg : p);
    this.packages$.next(updated);
    return of(pkg);
  }

  deletePackage(id: string): Observable<void> {
    const current = this.packages$.value;
    const updated = current.filter(p => p.id !== id);
    this.packages$.next(updated);
    return of(void 0);
  }

  getCurrentPackage(): Observable<Package | null> {
    return this.currentPackage$.asObservable();
  }

  setCurrentPackage(pkg: Package | null): void {
    this.currentPackage$.next(pkg);
  }
}
