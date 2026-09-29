import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    PrescriptionHeaderConfig,
    PrescriptionDoctorDetails,
    PrescriptionBodyConfig,
    PrescriptionFooterConfig,
    DEFAULT_HEADER_CONFIG,
    DEFAULT_BODY_CONFIG,
    DEFAULT_FOOTER_CONFIG
} from '../models/prescription-settings.model';

@Injectable({
    providedIn: 'root'
})
export class PrescriptionSettingsService {

    private headerConfigSubject = new BehaviorSubject<PrescriptionHeaderConfig>(DEFAULT_HEADER_CONFIG);
    private bodyConfigSubject = new BehaviorSubject<PrescriptionBodyConfig>(DEFAULT_BODY_CONFIG);
    private footerConfigSubject = new BehaviorSubject<PrescriptionFooterConfig>(DEFAULT_FOOTER_CONFIG);

    constructor() {
        this.loadSettings();
    }

    // Header Settings
    getHeaderConfig(): Observable<PrescriptionHeaderConfig> {
        return this.headerConfigSubject.asObservable();
    }

    updateHeaderConfig(config: PrescriptionHeaderConfig): void {
        this.headerConfigSubject.next(config);
        this.saveSettings();
    }

    // Body Settings
    getBodyConfig(): Observable<PrescriptionBodyConfig> {
        return this.bodyConfigSubject.asObservable();
    }

    updateBodyConfig(config: PrescriptionBodyConfig): void {
        this.bodyConfigSubject.next(config);
        this.saveSettings();
    }

    // Footer Settings
    getFooterConfig(): Observable<PrescriptionFooterConfig> {
        return this.footerConfigSubject.asObservable();
    }

    updateFooterConfig(config: PrescriptionFooterConfig): void {
        this.footerConfigSubject.next(config);
        this.saveSettings();
    }

    // Persistence (LocalStorage for now)
    private saveSettings(): void {
        const settings = {
            header: this.headerConfigSubject.value,
            body: this.bodyConfigSubject.value,
            footer: this.footerConfigSubject.value
        };
        localStorage.setItem('prescriptionSettings', JSON.stringify(settings));
    }

    private loadSettings(): void {
        const saved = localStorage.getItem('prescriptionSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                if (settings.header) this.headerConfigSubject.next(this.normalizeHeaderConfig(settings.header));

                if (settings.body) {
                    const legacyIdMap: Record<string, string> = {
                        'investigation': 'ix',
                        'drugHistory': 'dh',
                        'chiefComplaint': 'cc',
                        'onExamination': 'oe'
                    };

                    let mergedSections = (settings.body.sections || []).map((s: any) => {
                        // Migrate legacy IDs
                        if (legacyIdMap[s.id]) {
                            s.id = legacyIdMap[s.id];
                        }
                        return s;
                    });

                    const defaultSections = DEFAULT_BODY_CONFIG.sections;

                    // Deduplicate logic: ensure we only have one of each ID from defaults
                    const finalSections: any[] = [];
                    const addedIds = new Set<string>();

                    // 1. Process merged sections but filter out those no longer in defaults (or handle them)
                    // Note: If we want to allow custom sections, we should keep them.
                    // For now, let's just make sure we don't duplicate existing ones.
                    mergedSections.forEach((s: any) => {
                        if (!addedIds.has(s.id)) {
                            finalSections.push(s);
                            addedIds.add(s.id);
                        }
                    });

                    // 2. Add missing default sections
                    defaultSections.forEach(defSec => {
                        if (!addedIds.has(defSec.id)) {
                            finalSections.push(defSec);
                            addedIds.add(defSec.id);
                        } else {
                            // If it exists, update its label if it's a default one (optional)
                            // const existing = finalSections.find(s => s.id === defSec.id);
                            // if (existing) existing.label = defSec.label; 
                        }
                    });

                    // 3. Cleanup: Filter out any sections that are not strictly in DEFAULT_BODY_CONFIG 
                    // unless you want to support custom sections. 
                    // To solve user's "dh and del two times", we'll restrict to defaults for now or just deduplicate better.
                    const cleanedSections = finalSections.filter(s => defaultSections.find(ds => ds.id === s.id));

                    cleanedSections.sort((a: any, b: any) => {
                        const orderA = defaultSections.find(ds => ds.id === a.id)?.order ?? 99;
                        const orderB = defaultSections.find(ds => ds.id === b.id)?.order ?? 99;
                        return orderA - orderB;
                    });

                    this.bodyConfigSubject.next({
                        ...DEFAULT_BODY_CONFIG,
                        ...settings.body,
                        sections: cleanedSections
                    });
                } else {
                    this.bodyConfigSubject.next(DEFAULT_BODY_CONFIG);
                }

                if (settings.footer) this.footerConfigSubject.next({ ...DEFAULT_FOOTER_CONFIG, ...settings.footer });
            } catch (e) {
                console.error('Failed to load prescription settings', e);
            }
        }
    }

    private normalizeHeaderConfig(savedHeader: any): PrescriptionHeaderConfig {
        const emptyDoctor = DEFAULT_HEADER_CONFIG.banglaDoctor;
        const defaultEnglishDoctor = DEFAULT_HEADER_CONFIG.englishDoctor;

        if (savedHeader.banglaDoctor || savedHeader.englishDoctor) {
            return {
                ...DEFAULT_HEADER_CONFIG,
                ...savedHeader,
                banglaDoctor: {
                    ...emptyDoctor,
                    ...(savedHeader.banglaDoctor || {})
                },
                englishDoctor: {
                    ...defaultEnglishDoctor,
                    ...(savedHeader.englishDoctor || {})
                },
                patientFields: savedHeader.patientFields || DEFAULT_HEADER_CONFIG.patientFields
            };
        }

        const primaryDoctor: PrescriptionDoctorDetails = {
            name: savedHeader.doctorName || '',
            degrees: savedHeader.degrees || '',
            higherTraining: savedHeader.fellowship || '',
            designation: savedHeader.designation || '',
            specialty: savedHeader.specialtiesText || (savedHeader.specialties || []).join(', '),
            department: savedHeader.department || '',
            institute: savedHeader.institute || '',
            regNo: savedHeader.regNo || '',
            phone: '',
            additionalInfo: savedHeader.additionalDoctorInfo || ''
        };

        const alternateDoctor: PrescriptionDoctorDetails = {
            name: savedHeader.alternateDoctorName || '',
            degrees: savedHeader.alternateDegrees || '',
            higherTraining: savedHeader.alternateHigherTraining || '',
            designation: savedHeader.alternateDesignation || '',
            specialty: '',
            department: savedHeader.alternateDepartment || '',
            institute: savedHeader.alternateInstitute || '',
            regNo: '',
            phone: savedHeader.alternatePhone || '',
            additionalInfo: ''
        };

        const hasAlternateDoctor = Boolean(
            savedHeader.showAlternateDoctorDetails &&
            Object.values(alternateDoctor).some(value => value.trim().length > 0)
        );

        const normalized: Record<string, any> = {
            ...DEFAULT_HEADER_CONFIG,
            ...savedHeader,
            banglaDoctor: hasAlternateDoctor ? primaryDoctor : { ...emptyDoctor },
            englishDoctor: hasAlternateDoctor ? alternateDoctor : {
                ...defaultEnglishDoctor,
                ...primaryDoctor
            },
            patientFields: savedHeader.patientFields || DEFAULT_HEADER_CONFIG.patientFields
        };

        [
            'doctorName', 'showDoctorName', 'designation', 'showDesignation',
            'degrees', 'showDegrees', 'fellowship', 'showFellowship',
            'specialties', 'showSpecialties', 'specialtiesText', 'department',
            'showDepartment', 'institute', 'showInstitute', 'regNo', 'showRegNo',
            'email', 'showEmail', 'additionalDoctorInfo', 'showAdditionalDoctorInfo',
            'showAlternateDoctorDetails', 'alternateDoctorName', 'alternateDegrees',
            'alternateHigherTraining', 'alternateDesignation', 'alternateDepartment',
            'alternateInstitute', 'alternatePhone'
        ].forEach(key => delete normalized[key]);

        return normalized as PrescriptionHeaderConfig;
    }
}
