import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Configuration for dynamic SweetAlert confirmations
 */
export interface ConfirmationConfig {
  title?: string;
  text?: string;
  icon?: 'warning' | 'error' | 'info' | 'question' | 'success';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  showCancelButton?: boolean;
  requireSelection?: boolean; // If true, requires selected rows
  selectionCount?: number; // Number of selected items
  itemName?: string; // Name of the item being acted upon (for single item actions)
}

/**
 * Service for dynamic SweetAlert confirmations
 * Provides reusable confirmation dialogs for different action types
 */
@Injectable({
  providedIn: 'root'
})
export class SweetAlertConfirmationService {

  /**
   * Get default configuration for an action type
   * @param actionName The name of the action (e.g., 'Delete', 'Duplicate', 'Export')
   * @param config Optional custom configuration to override defaults
   * @returns SweetAlertOptions
   */
  getConfirmationConfig(actionName: string, config?: Partial<ConfirmationConfig>): SweetAlertOptions {
    const actionLower = actionName.toLowerCase();
    const defaultConfig: ConfirmationConfig = {
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      ...config
    };

    // Configure based on action type
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return {
        title: config?.title || (config?.selectionCount && config.selectionCount > 1 
          ? `Delete ${config.selectionCount} Selected Item(s)?` 
          : config?.itemName 
            ? `Delete "${config.itemName}"?` 
            : 'Delete Item?'),
        text: config?.text || (config?.selectionCount && config.selectionCount > 1
          ? `Are you sure you want to delete ${config.selectionCount} item(s)? This action cannot be undone.`
          : config?.itemName
            ? `Are you sure you want to delete "${config.itemName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this item? This action cannot be undone.'),
        icon: 'warning',
        confirmButtonText: config?.confirmButtonText || 'Yes, delete!',
        confirmButtonColor: config?.confirmButtonColor || '#ef4444',
        ...defaultConfig
      };
    } else if (actionLower.includes('duplicate') || actionLower.includes('copy')) {
      return {
        title: config?.title || (config?.selectionCount && config.selectionCount > 1
          ? `Duplicate ${config.selectionCount} Selected Item(s)?`
          : config?.itemName
            ? `Duplicate "${config.itemName}"?`
            : 'Duplicate Item?'),
        text: config?.text || (config?.selectionCount && config.selectionCount > 1
          ? `Are you sure you want to duplicate ${config.selectionCount} item(s)?`
          : config?.itemName
            ? `Are you sure you want to duplicate "${config.itemName}"?`
            : 'Are you sure you want to duplicate this item?'),
        icon: 'question',
        confirmButtonText: config?.confirmButtonText || 'Yes, duplicate!',
        confirmButtonColor: config?.confirmButtonColor || '#10b981',
        ...defaultConfig
      };
    } else if (actionLower.includes('export')) {
      return {
        title: config?.title || (config?.selectionCount && config.selectionCount > 1
          ? `Export ${config.selectionCount} Selected Item(s)?`
          : 'Export Data?'),
        text: config?.text || (config?.selectionCount && config.selectionCount > 1
          ? `Are you sure you want to export ${config.selectionCount} item(s)?`
          : 'Are you sure you want to export the data?'),
        icon: 'info',
        confirmButtonText: config?.confirmButtonText || 'Yes, export!',
        confirmButtonColor: config?.confirmButtonColor || '#3b82f6',
        ...defaultConfig
      };
    } else if (actionLower.includes('import')) {
      return {
        title: config?.title || 'Import Data?',
        text: config?.text || 'Are you sure you want to import data? This may overwrite existing records.',
        icon: 'warning',
        confirmButtonText: config?.confirmButtonText || 'Yes, import!',
        confirmButtonColor: config?.confirmButtonColor || '#3b82f6',
        ...defaultConfig
      };
    } else if (actionLower.includes('approve')) {
      return {
        title: config?.title || (config?.selectionCount && config.selectionCount > 1
          ? `Approve ${config.selectionCount} Selected Item(s)?`
          : 'Approve Item?'),
        text: config?.text || (config?.selectionCount && config.selectionCount > 1
          ? `Are you sure you want to approve ${config.selectionCount} item(s)?`
          : 'Are you sure you want to approve this item?'),
        icon: 'question',
        confirmButtonText: config?.confirmButtonText || 'Yes, approve!',
        confirmButtonColor: config?.confirmButtonColor || '#10b981',
        ...defaultConfig
      };
    } else if (actionLower.includes('reject') || actionLower.includes('cancel')) {
      return {
        title: config?.title || (config?.selectionCount && config.selectionCount > 1
          ? `Reject ${config.selectionCount} Selected Item(s)?`
          : 'Reject Item?'),
        text: config?.text || (config?.selectionCount && config.selectionCount > 1
          ? `Are you sure you want to reject ${config.selectionCount} item(s)?`
          : 'Are you sure you want to reject this item?'),
        icon: 'warning',
        confirmButtonText: config?.confirmButtonText || 'Yes, reject!',
        confirmButtonColor: config?.confirmButtonColor || '#ef4444',
        ...defaultConfig
      };
    } else {
      // Generic confirmation for unknown actions
      return {
        title: config?.title || `${actionName}?`,
        text: config?.text || `Are you sure you want to ${actionName.toLowerCase()}?`,
        icon: config?.icon || 'question',
        confirmButtonText: config?.confirmButtonText || `Yes, ${actionName.toLowerCase()}!`,
        confirmButtonColor: config?.confirmButtonColor || '#3b82f6',
        ...defaultConfig
      };
    }
  }

  /**
   * Show a confirmation dialog for an action
   * @param actionName The name of the action
   * @param config Optional configuration to customize the dialog
   * @returns Promise that resolves to SweetAlertResult
   */
  async confirm(actionName: string, config?: Partial<ConfirmationConfig>): Promise<SweetAlertResult> {
    const options = this.getConfirmationConfig(actionName, config);
    return await Swal.fire(options);
  }

  /**
   * Show a confirmation dialog and execute a callback if confirmed
   * @param actionName The name of the action
   * @param onConfirm Callback to execute if user confirms
   * @param config Optional configuration to customize the dialog
   */
  confirmAndExecute(
    actionName: string,
    onConfirm: () => void | Promise<void>,
    config?: Partial<ConfirmationConfig>
  ): void {
    this.confirm(actionName, config).then((result) => {
      if (result.isConfirmed) {
        const callbackResult = onConfirm();
        // Handle async callbacks
        if (callbackResult instanceof Promise) {
          callbackResult.catch(error => {
            console.error(`Error executing ${actionName}:`, error);
          });
        }
      }
    });
  }

  /**
   * Check if an action requires confirmation
   * @param actionName The name of the action
   * @returns true if the action should show a confirmation dialog
   */
  requiresConfirmation(actionName: string): boolean {
    const actionLower = actionName.toLowerCase();
    const actionsRequiringConfirmation = [
      'delete', 'remove', 'duplicate', 'copy', 'export', 'import',
      'approve', 'reject', 'cancel', 'archive', 'restore'
    ];
    return actionsRequiringConfirmation.some(action => actionLower.includes(action));
  }
}
