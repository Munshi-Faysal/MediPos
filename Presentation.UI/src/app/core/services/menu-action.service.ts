import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, PaginationParams } from '../models';
import {
  MenuAction,
  MenuActionListItem,
  CreateMenuActionRequest,
  UpdateMenuActionRequest,
  MenuWithActions,
  AssignActionsToMenuRequest,
  SaveMenuActionsRequest
} from '../models/menu-action.model';

/**
 * MenuAction Service for managing menu actions
 * Uses the unified ApiService for all HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class MenuActionService {
  private api = inject(ApiService);

  private readonly endpoint = '/MenuAction';

  /**
   * Get paginated list of menu actions
   */
  getMenuActions(params: PaginationParams & {
    isActive?: boolean;
  } = {}): Observable<PagedResponse<MenuActionListItem>> {
    return this.api.getPaginated<MenuActionListItem>(this.endpoint, params);
  }

  /**
   * Get all active menu actions (for dropdowns)
   */
  getActiveMenuActions(): Observable<MenuAction[]> {
    return this.api.get<MenuAction[]>(`${this.endpoint}/active`);
  }

  /**
   * Get menu action by ID
   */
  getMenuActionById(id: string): Observable<MenuAction> {
    return this.api.get<MenuAction>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new menu action
   */
  createMenuAction(menuAction: CreateMenuActionRequest): Observable<MenuAction> {
    return this.api.post<MenuAction>(this.endpoint, menuAction);
  }

  /**
   * Update an existing menu action
   */
  updateMenuAction(id: string, menuAction: UpdateMenuActionRequest): Observable<MenuAction> {
    return this.api.put<MenuAction>(`${this.endpoint}/${id}`, menuAction);
  }

  /**
   * Delete a menu action
   */
  deleteMenuAction(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Activate a menu action
   */
  activateMenuAction(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a menu action
   */
  deactivateMenuAction(id: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }

  // ==================== Menu-Action Assignments ====================

  /**
   * Get all menus with their assigned actions
   */
  getMenusWithActions(): Observable<MenuWithActions[]> {
    return this.api.get<MenuWithActions[]>(`${this.endpoint}/menus-with-actions`);
  }

  /**
   * Get a specific menu with its assigned actions
   */
  getMenuWithActions(menuId: string): Observable<MenuWithActions> {
    return this.api.get<MenuWithActions>(`${this.endpoint}/menus-with-actions/${menuId}`);
  }

  /**
   * Assign actions to a menu (replaces existing assignments)
   */
  assignActionsToMenu(dto: AssignActionsToMenuRequest): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/assign`, dto);
  }

  /**
   * Save multiple menu-action assignments (bulk save from UI grid)
   */
  saveMenuActions(dto: SaveMenuActionsRequest): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/save`, dto);
  }

  /**
   * Get menu action statistics (for header cards)
   * Fetches counts for total, active, and inactive actions
   */
  getMenuActionStatistics(): Observable<{
    totalActions: number;
    activeActions: number;
    inactiveActions: number;
  }> {
    // Fetch all actions and filtered counts in parallel for accurate statistics
    const allParams = { page: 1, pageSize: 10000 };
    const activeParams = { page: 1, pageSize: 10000, isActive: true };
    const inactiveParams = { page: 1, pageSize: 10000, isActive: false };

    return new Observable(observer => {
      forkJoin({
        all: this.getMenuActions(allParams),
        active: this.getMenuActions(activeParams),
        inactive: this.getMenuActions(inactiveParams)
      }).subscribe({
        next: (results) => {
          const statistics = {
            totalActions: results.all.totalCount,
            activeActions: results.active.totalCount,
            inactiveActions: results.inactive.totalCount
          };
          observer.next(statistics);
          observer.complete();
        },
        error: (error) => {
          // Fallback: try with just the all query
          this.getMenuActions(allParams).subscribe({
            next: (response) => {
              const allActions = response.data;
              const statistics = {
                totalActions: response.totalCount,
                activeActions: allActions.filter(a => a.isActive).length,
                inactiveActions: allActions.filter(a => !a.isActive).length
              };
              observer.next(statistics);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }
}
