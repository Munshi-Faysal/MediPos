/**
 * Menu models matching backend DTOs
 */

export interface Menu {
  id: string;
  name: string;
  label?: string;
  parentId?: string;
  parentName?: string;
  route?: string;
  priority: number;
  icon?: string;
  isExpandable: boolean;
  type?: string; // 'link' or 'dropdown'
  isActive: boolean;
  order?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  childrenCount: number;
  children?: Menu[]; // For hierarchical structure
}

export interface MenuListItem {
  id: string;
  name: string;
  label?: string;
  parentId?: string;
  parentName?: string;
  route?: string;
  priority: number;
  icon?: string;
  isExpandable: boolean;
  type?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  childrenCount: number;
  children?: MenuListItem[]; // For hierarchical structure
}

/**
 * Sidebar menu item structure (mapped from API Menu)
 */
export interface SidebarMenuItem {
  id: string;
  label: string;
  route: string | null;
  icon: string;
  type: 'link' | 'dropdown';
  order: number;
  roles?: string[];
  children?: SidebarMenuItem[];
}

export interface CreateMenuRequest {
  name: string;
  label?: string;
  parentId?: string;
  route?: string;
  priority?: number;
  icon?: string;
  isExpandable?: boolean;
  type?: string;
  isActive?: boolean;
  order?: number;
  description?: string;
}

export interface UpdateMenuRequest {
  name: string;
  label?: string;
  parentId?: string;
  route?: string;
  priority?: number;
  icon?: string;
  isExpandable?: boolean;
  type?: string;
  isActive: boolean;
  order?: number;
  description?: string;
}

export interface MenuFilters {
  search?: string;
  isActive?: boolean;
  parentId?: string;
}

/**
 * SidebarMenu interface matching Workflow.Presentation.UI
 * Used for GetUserMenus API endpoint
 */
export interface SidebarMenu {
  id: number;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  parentMenuId?: number;
  parentMenuName?: string;
}

/**
 * Menu interface matching Workflow.Presentation.UI
 * Used for GetAll, Create, Edit API endpoints
 */
export interface UIMenu {
  id: number;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  parentMenuId?: number;
  parentMenuName?: string;
  creator: string;
  modifier: string;
  createdDate: Date;
  updatedDate: Date;
  isActive: boolean;
  encryptedId: string;
}

/**
 * MenuInit interface matching Workflow.Presentation.UI
 * Used for Init API endpoint
 */
export interface MenuInit {
  parentMenuList: { id: number; value: string }[];
  branchMappingList?: any[];
}

