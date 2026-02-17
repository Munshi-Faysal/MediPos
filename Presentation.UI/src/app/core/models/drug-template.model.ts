export interface TemplateDrug {
    id: number;
    brandName: string;
    genericName: string;
    strength: string;
    company: string;
    type: string;
}

export interface TemplateDrugEntry {
    drug: TemplateDrug;
    dose: string;
    duration: string;
    durationType: 'Days' | 'Months' | 'Years';
    instruction: 'Before Food' | 'After Food' | null;
    instructionText?: string;
}

export interface DrugTemplate {
    id: number;
    name: string;
    drugCount: number;
    drugs: TemplateDrugEntry[]; // Full details
    createdDate: Date;
}
