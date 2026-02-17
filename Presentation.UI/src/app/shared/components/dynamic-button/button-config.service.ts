import { computed, Signal } from '@angular/core';
import { DynamicButtonConfig } from './dynamic-button.component';

/**
 * Button Configuration Service
 * Provides reusable button configurations for common actions
 */
export class ButtonConfigService {
  /**
   * Get Create Button Configuration
   */
  static getCreateButton(loading: Signal<boolean>, label = 'Create', tooltip = 'Create new item'): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'create',
      variant: 'primary',
      icon: 'add',
      size: 'md',
      disabled: loading(),
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Delete Selected Button Configuration
   */
  static getDeleteSelectedButton(
    selectedCount: Signal<number>,
    loading: Signal<boolean>,
    label = 'Delete Selected',
    tooltip?: string
  ): Signal<DynamicButtonConfig> {
    return computed(() => {
      const count = selectedCount();
      const isLoading = loading();
      return {
        label: label,
        action: 'deleteSelected',
        variant: 'danger',
        icon: 'delete',
        size: 'md',
        disabled: count === 0 || isLoading,
        visible: true,
        tooltip: tooltip || (count > 0 ? `Delete ${count} selected item(s)` : 'Select items to delete')
      };
    });
  }

  /**
   * Get Export Button Configuration
   */
  static getExportButton(
    disabled?: Signal<boolean>,
    label = 'Export',
    tooltip = 'Export data'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'export',
      variant: 'outline',
      icon: 'export',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Import Button Configuration
   */
  static getImportButton(
    disabled?: Signal<boolean>,
    label = 'Import',
    tooltip = 'Import data'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'import',
      variant: 'outline',
      icon: 'import',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Refresh Button Configuration
   */
  static getRefreshButton(
    disabled?: Signal<boolean>,
    label = 'Refresh',
    tooltip = 'Refresh data'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'refresh',
      variant: 'outline',
      icon: 'refresh',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Print Button Configuration
   */
  static getPrintButton(
    disabled?: Signal<boolean>,
    label = 'Print',
    tooltip = 'Print data'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'print',
      variant: 'outline',
      icon: 'print',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Duplicate Button Configuration
   */
  static getDuplicateButton(
    disabled?: Signal<boolean>,
    label = 'Duplicate',
    tooltip = 'Duplicate item'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'duplicate',
      variant: 'success',
      icon: 'duplicate',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Edit Button Configuration
   */
  static getEditButton(
    disabled?: Signal<boolean>,
    label = 'Edit',
    tooltip = 'Edit item'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'edit',
      variant: 'primary',
      icon: 'edit',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Save Button Configuration
   */
  static getSaveButton(
    loading: Signal<boolean>,
    label = 'Save',
    tooltip = 'Save changes'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'save',
      variant: 'primary',
      icon: 'save',
      size: 'md',
      disabled: loading(),
      loading: loading(),
      visible: true,
      tooltip: tooltip
    }));
  }

  /**
   * Get Cancel Button Configuration
   */
  static getCancelButton(
    disabled?: Signal<boolean>,
    label = 'Cancel',
    tooltip = 'Cancel'
  ): Signal<DynamicButtonConfig> {
    return computed(() => ({
      label: label,
      action: 'cancel',
      variant: 'outline',
      icon: 'cancel',
      size: 'md',
      disabled: disabled ? disabled() : false,
      visible: true,
      tooltip: tooltip
    }));
  }
}

