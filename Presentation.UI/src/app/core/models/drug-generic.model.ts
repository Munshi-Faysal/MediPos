export interface DrugGeneric {
    id: number;
    name: string;
    indication?: string;
    sideEffects?: string;
    isActive: boolean;
    encryptedId?: string;
    createdAt?: Date;
}
