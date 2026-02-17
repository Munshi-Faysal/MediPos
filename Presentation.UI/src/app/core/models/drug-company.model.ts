export interface DrugCompany {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    encryptedId?: string;
    createdAt?: Date;
}
