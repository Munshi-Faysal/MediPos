/**
 * MenuAction models matching backend DTOs
 */

export interface MenuAction {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  actionColor?: string;
  isSelected: boolean;
  isShowInTopBar: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  menuCount: number;
}

export interface MenuActionListItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  actionColor?: string;
  isSelected: boolean;
  isShowInTopBar: boolean;
  isActive: boolean;
  createdAt: string;
  menuCount: number;
}

export interface CreateMenuActionRequest {
  name: string;
  description?: string;
  icon?: string;
  actionColor?: string;
  isSelected?: boolean;
  isShowInTopBar?: boolean;
  isActive?: boolean;
}

export interface UpdateMenuActionRequest {
  name: string;
  description?: string;
  icon?: string;
  actionColor?: string;
  isSelected: boolean;
  isShowInTopBar: boolean;
  isActive: boolean;
}

/**
 * Menu with its assigned actions
 */
export interface MenuWithActions {
  menuId: string;
  menuName: string;
  menuLabel?: string;
  parentId?: string;
  parentName?: string;
  actions: MenuAction[];
}

/**
 * DTO for assigning actions to a menu
 */
export interface AssignActionsToMenuRequest {
  menuId: string;
  actionIds: string[];
}

/**
 * Individual menu-action assignment for bulk save
 */
export interface MenuActionAssignment {
  menuId: string;
  actionId: string;
  isAssigned: boolean;
}

/**
 * DTO for bulk saving menu actions
 */
export interface SaveMenuActionsRequest {
  assignments: MenuActionAssignment[];
}

export interface MenuActionFilters {
  search?: string;
  isActive?: boolean;
}
