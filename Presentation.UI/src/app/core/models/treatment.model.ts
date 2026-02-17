export interface TreatmentDrugViewModel {
    encryptedId?: string;
    drugDetailEncryptedId?: string;
    brandName?: string;
    genericName?: string;
    strength?: string;
    type?: string;
    company?: string;
    dose?: string;
    duration?: string;
    durationType?: string;
    instruction?: string;
    instructionText?: string;
}

export interface TreatmentTemplateViewModel {
    encryptedId?: string;
    name: string;
    drugCount: number;
    createdDate: Date;
    treatmentDrugs?: TreatmentDrugViewModel[];
}

export interface TreatmentDrugDto {
    id?: number;
    encryptedId?: string;
    treatmentTemplateId?: number;
    treatmentTemplateEncryptedId?: string;
    drugDetailId?: number;
    drugDetailEncryptedId?: string;
    dose?: string;
    duration?: string;
    durationType?: string;
    instruction?: string;
    instructionText?: string;
}

export interface TreatmentTemplateDto {
    id?: number;
    encryptedId?: string;
    name: string;
    doctorId: number;
    doctorEncryptedId?: string;
    treatmentDrugs: TreatmentDrugDto[];
}
