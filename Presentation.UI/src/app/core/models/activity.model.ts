/**
 * Activity models matching backend DTOs
 */

export interface Activity {
  id?: number;
  activityName: string;
  creator?: string;
  modifier?: string;
  createdDate?: Date;
  updatedDate?: Date;
  isActive: boolean;
  encryptedId: string;
}

export interface ActivityListItem {
  id: string;
  activityName: string;
  isActive: boolean;
  encryptedId: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateActivityRequest {
  activityName: string;
  isActive?: boolean;
}

export interface UpdateActivityRequest {
  activityName: string;
  isActive: boolean;
  encryptedId: string;
}


