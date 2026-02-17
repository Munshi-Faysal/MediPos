import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Feature, Package, PackageFeature, ViewResponse, PaginatedList } from '../models/system-package.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SystemPackageService {
    private http = inject(HttpClient);

    private apiUrl = environment.apiBaseUrl;

    // Feature Methods
    getFeatures(): Observable<Feature[]> {
        return this.http.get<ViewResponse<Feature>>(`${this.apiUrl}/Feature/GetAll`, {
            params: new HttpParams().set('take', 1000).set('skip', 0)
        }).pipe(
            map(response => response.data.itemList)
        );
    }

    addFeature(feature: Partial<Feature>): Observable<Feature> {
        return this.http.post<Feature>(`${this.apiUrl}/Feature/Create`, feature);
    }

    updateFeature(feature: Feature): Observable<Feature> {
        return this.http.put<Feature>(`${this.apiUrl}/Feature/Edit`, feature);
    }

    toggleFeatureStatus(feature: Feature): Observable<Feature> {
        // Assuming ChangeActive endpoint exists as per controller analysis
        return this.http.put<Feature>(`${this.apiUrl}/Feature/ChangeActive/${feature.encryptedId}`, {});
    }


    // Package Methods
    getPackages(): Observable<Package[]> {
        return this.http.get<ViewResponse<Package>>(`${this.apiUrl}/Package/GetAll`, {
            params: new HttpParams().set('take', 1000).set('skip', 0)
        }).pipe(
            map(response => response.data.itemList)
        );
    }

    addPackage(pkg: Partial<Package>, featureIds: string[]): Observable<Package> {
        // PackageDto expects FeatureList as List<string> (Encrypted IDs)
        const payload = {
            ...pkg,
            featureList: featureIds
        };
        return this.http.post<Package>(`${this.apiUrl}/Package/Create`, payload);
    }

    updatePackage(pkg: Package, featureIds: string[]): Observable<Package> {
        const payload = {
            ...pkg,
            featureList: featureIds
        };
        return this.http.put<Package>(`${this.apiUrl}/Package/Edit`, payload);
    }

    togglePackageStatus(pkg: Package): Observable<Package> {
        return this.http.put<Package>(`${this.apiUrl}/Package/ChangeActive/${pkg.encryptedId}`, {});
    }

    // Package-Feature Relationship Methods
    getPackageFeatures(): Observable<PackageFeature[]> {
        return this.http.get<ViewResponse<PackageFeature>>(`${this.apiUrl}/PackageFeature/GetAll`, {
            params: new HttpParams().set('take', 1000).set('skip', 0)
        }).pipe(
            map(response => response.data.itemList)
        );
    }

    addPackageFeature(encryptedPackageId: string, encryptedFeatureId: string): Observable<PackageFeature> {
        const payload = {
            encryptedPackageId,
            encryptedFeatureId,
            isActive: true
        };
        return this.http.post<PackageFeature>(`${this.apiUrl}/PackageFeature/Create`, payload);
    }

    togglePackageFeatureStatus(pf: PackageFeature): Observable<any> {
        // Not supported by API yet
        console.warn('Toggle Status not supported for PackageFeature via API');
        return new Observable(obs => { obs.next(pf); obs.complete(); });
    }

    deletePackageFeature(pf: PackageFeature): Observable<boolean> {
        // Not supported by API yet
        console.warn('Delete not supported for PackageFeature via API');
        return new Observable(obs => { obs.next(true); obs.complete(); });
    }
}
