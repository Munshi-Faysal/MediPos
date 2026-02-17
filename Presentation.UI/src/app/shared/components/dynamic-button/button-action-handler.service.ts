import { Injectable } from '@angular/core';

/**
 * Button Action Handler Configuration
 * Maps action names to their handler functions
 */
export type ButtonActionHandlers = Record<string, (context?: any) => void | Promise<void>>;

/**
 * Component Action Callbacks
 * Allows components to provide specific implementations for actions
 */
export interface ComponentActionCallbacks {
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onPrint?: () => void;
  onDuplicate?: () => void;
  onCreate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onBulkDelete?: () => void;
  notificationService?: any; // Optional notification service for common actions
}

/**
 * Button Action Handler Service
 * Manages button click actions in a reusable way
 */
@Injectable({
  providedIn: 'root'
})
export class ButtonActionHandlerService {

  /**
   * Creates a button click handler function that routes actions to their respective handlers
   * @param handlers Map of action names to handler functions
   * @param context Optional context object to pass to handlers
   * @returns A handler function that can be used in components
   */
  createHandler(handlers: ButtonActionHandlers, context?: any): (action: string) => void {
    return (action: string) => {
      const handler = handlers[action];
      if (handler) {
        try {
          const result = handler(context);
          // Handle async handlers
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error executing action "${action}":`, error);
            });
          }
        } catch (error) {
          console.error(`Error executing action "${action}":`, error);
        }
      } else {
        console.warn(`No handler found for action: "${action}"`);
      }
    };
  }

  /**
   * Helper method to create a handler with common action handlers pre-configured
   * Components can provide callbacks for specific actions, or use defaults
   * @param callbacks Component-specific callbacks
   * @param context Optional context object (usually the component itself)
   * @returns A handler function
   */
  createHandlerWithDefaults(callbacks: ComponentActionCallbacks = {}, context?: any): (action: string) => void {
    const notificationService = callbacks.notificationService || context?.notificationService;

    const defaultHandlers: ButtonActionHandlers = {
      refresh: () => {
        if (callbacks.onRefresh) {
          callbacks.onRefresh();
        } else if (context?.refreshData) {
          context.refreshData();
        }
      },
      export: () => {
        if (callbacks.onExport) {
          callbacks.onExport();
        } else if (context?.exportData) {
          context.exportData();
        } else {
          // Default implementation
          if (notificationService) {
            notificationService.info('Export', 'Export functionality will be implemented');
          } else {
            console.info('Export action triggered');
          }
        }
      },
      import: () => {
        if (callbacks.onImport) {
          callbacks.onImport();
        } else if (context?.importData) {
          context.importData();
        } else {
          // Default implementation
          if (notificationService) {
            notificationService.info('Import', 'Import functionality will be implemented');
          } else {
            console.info('Import action triggered');
          }
        }
      },
      print: () => {
        if (callbacks.onPrint) {
          callbacks.onPrint();
        } else if (context?.printData) {
          context.printData();
        } else {
          // Default implementation
          if (notificationService) {
            notificationService.info('Print', 'Print functionality will be implemented');
          } else {
            console.info('Print action triggered');
          }
        }
      },
      duplicate: () => {
        if (callbacks.onDuplicate) {
          callbacks.onDuplicate();
        } else if (context?.duplicateData) {
          context.duplicateData();
        } else {
          // Default implementation
          if (notificationService) {
            notificationService.info('Duplicate', 'Duplicate functionality will be implemented');
          } else {
            console.info('Duplicate action triggered');
          }
        }
      },
      create: () => {
        if (callbacks.onCreate) {
          callbacks.onCreate();
        } else if (context?.openCreateModal) {
          context.openCreateModal();
        }
      },
      deleteSelected: () => {
        if (callbacks.onBulkDelete) {
          callbacks.onBulkDelete();
        } else if (context?.bulkDelete) {
          context.bulkDelete();
        }
      }
    };

    return this.createHandler(defaultHandlers, context);
  }

  /**
   * Legacy method - use createHandlerWithDefaults with callbacks instead
   * @deprecated Use createHandlerWithDefaults with ComponentActionCallbacks
   */
  createHandlerWithLegacyDefaults(handlers: Partial<ButtonActionHandlers>, context?: any): (action: string) => void {
    return this.createHandlerWithDefaults({}, context);
  }
}

/**
 * Utility function to create a button action handler
 * This is a convenience function for creating handlers without injecting the service
 */
export function createButtonActionHandler(
  handlers: ButtonActionHandlers,
  context?: any
): (action: string) => void {
  const service = new ButtonActionHandlerService();
  return service.createHandler(handlers, context);
}

/**
 * Helper function to create handlers by automatically mapping action names to component methods
 * Maps actions like 'create' to methods like 'openCreateModal', 'export' to 'exportData', etc.
 * @param component Component instance with methods to call
 * @param customMappings Optional custom mappings for actions that don't follow the default pattern
 * @returns A handler function
 */
export function createButtonHandlerFromComponent(
  component: any,
  customMappings?: Record<string, string>
): (action: string) => void {
  const defaultMappings: Record<string, string> = {
    create: 'openCreateModal',
    deleteSelected: 'bulkDelete',
    export: 'exportData',
    import: 'importData',
    refresh: 'refreshData',
    print: 'printData',
    duplicate: 'duplicateData',
    edit: 'editItem',
    save: 'saveData',
    cancel: 'cancelAction'
  };

  const mappings = { ...defaultMappings, ...customMappings };
  const handlers: ButtonActionHandlers = {};

  // Create handlers by mapping actions to component methods
  Object.keys(mappings).forEach(action => {
    const methodName = mappings[action];
    if (component[methodName] && typeof component[methodName] === 'function') {
      handlers[action] = () => component[methodName]();
    }
  });

  return createButtonActionHandler(handlers, component);
}

