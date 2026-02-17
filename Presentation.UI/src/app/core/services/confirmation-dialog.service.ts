import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogSubject = new Subject<ConfirmationDialogData | null>();
  private resultSubject = new Subject<boolean>();

  public dialog$ = this.dialogSubject.asObservable();

  showConfirmation(data: ConfirmationDialogData): Observable<boolean> {
    this.dialogSubject.next(data);
    return this.resultSubject.asObservable();
  }

  confirm(result: boolean): void {
    this.resultSubject.next(result);
    this.dialogSubject.next(null);
  }

  // Convenience methods
  showLogoutConfirmation(): Observable<boolean> {
    return this.showConfirmation({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      details: 'You will need to login again to access the system.',
      confirmText: 'Logout',
      cancelText: 'Cancel'
    });
  }

  showDeleteConfirmation(itemName = 'item'): Observable<boolean> {
    return this.showConfirmation({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${itemName}?`,
      details: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  }

  showSaveConfirmation(): Observable<boolean> {
    return this.showConfirmation({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      details: 'Unsaved changes will be lost.',
      confirmText: 'Save',
      cancelText: 'Discard'
    });
  }
}
