export interface ViewResponse<T> {
    isSuccess: boolean;
    message: string;
    data: PaginatedList<T>;
}

export interface PaginatedList<T> {
    itemList: T[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface Feature {
    encryptedId?: string; // Optional for new
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder?: number;

    // UI Helpers
    id?: number; // Deprecated, use encryptedId
    featureName?: string; // Deprecated, use name
}

export interface Package {
    encryptedId?: string;
    name: string;
    description?: string;
    price: number;
    duration: string; // "30 Days"
    isActive: boolean;
    isPopular: boolean;
    displayOrder?: number;

    // UI Helpers
    id?: number;
    packageName?: string;
    durationInDays?: number; // for UI calc if needed
    userLimit?: number; // Missing in API

    // From API GetList/Details
    featureList?: string[];

    // Virtual
    features?: Feature[];
}

export interface PackageFeature {
    encryptedId?: string;

    // From ViewModel
    packageName: string;
    featureName: string;
    isActive: boolean;
    displayOrder?: number;

    // From ViewModel
    packageEncryptedId?: string;
    featureEncryptedId?: string;

    // For Creation (DTO)
    packageId?: number;
    featureId?: number;
}

