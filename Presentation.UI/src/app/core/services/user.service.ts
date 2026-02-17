import { Injectable, signal, inject } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService, PagedResponse, PaginationParams } from './api.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  branchId?: string;
  orgUnitId?: string;
  designationId?: string;
  gradeId?: string;
  lineManagerId?: string;
  departmentId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Profile completion
  profileCompleted: boolean;
  timezone?: string;
  twoFactorEnabled: boolean;
  // Employment details
  employeeId?: string;
  joiningDate?: Date;
  // Permissions
  permissions: string[];
  effectivePermissions: string[];
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  isActive: boolean;
}

export interface UserInvite {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  branchId?: string;
  orgUnitId?: string;
  designationId?: string;
  gradeId?: string;
  lineManagerId?: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  inviteToken: string;
}

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  children: OrgChartNode[];
  level: number;
  isManager: boolean;
  teamSize: number;
  branch?: string;
  orgUnit?: string;
}

export interface ApprovalPath {
  requestType: string;
  approvers: ApprovalStep[];
  estimatedDays: number;
  canEscalate: boolean;
}

export interface ApprovalStep {
  userId: string;
  userName: string;
  userRole: string;
  order: number;
  isRequired: boolean;
  estimatedDays: number;
}

export interface ChatThread {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'SYSTEM';
  attachments?: ChatAttachment[];
  timestamp: Date;
  isRead: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  errors: BulkImportError[];
  warnings: string[];
}

export interface BulkImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  private readonly endpoint = '/v1/users';
  
  private usersSubject = new BehaviorSubject<User[]>([]);
  private rolesSubject = new BehaviorSubject<UserRole[]>([]);
  private invitesSubject = new BehaviorSubject<UserInvite[]>([]);
  private orgChartSubject = new BehaviorSubject<OrgChartNode[]>([]);
  private chatThreadsSubject = new BehaviorSubject<ChatThread[]>([]);
  
  // Signals for reactive programming
  public users = signal<User[]>([]);
  public roles = signal<UserRole[]>([]);
  public invites = signal<UserInvite[]>([]);
  public orgChart = signal<OrgChartNode[]>([]);
  public chatThreads = signal<ChatThread[]>([]);
  public isLoading = signal(false);

  constructor() {
    // Subscribe to subjects and update signals
    this.usersSubject.subscribe(users => this.users.set(users));
    this.rolesSubject.subscribe(roles => this.roles.set(roles));
    this.invitesSubject.subscribe(invites => this.invites.set(invites));
    this.orgChartSubject.subscribe(chart => this.orgChart.set(chart));
    this.chatThreadsSubject.subscribe(threads => this.chatThreads.set(threads));
  }

  // Users Management
  getUsers(params: PaginationParams & { isActive?: boolean } = {}): Observable<PagedResponse<User>> {
    this.isLoading.set(true);
    
    return this.api.getPaginated<any>(this.endpoint, params).pipe(
      map(response => {
        const mappedData = response.data.map((u: any) => this.mapUserListDtoToUser(u));
        
        return {
          ...response,
          data: mappedData
        };
      }),
      tap(response => {
        this.usersSubject.next(response.data);
        this.isLoading.set(false);
      })
    );
  }

  getAllActiveUsers(): Observable<User[]> {
    this.isLoading.set(true);
    
    return this.api.get<any[]>(`${this.endpoint}/active`).pipe(
      map(users => users.map(u => this.mapUserListDtoToUser(u))),
      tap(users => {
        this.usersSubject.next(users);
        this.isLoading.set(false);
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<any>(`${this.endpoint}/${id}`).pipe(
      map(user => this.mapUserDtoToUser(user))
    );
  }

  createUser(user: {
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password?: string;
    emailConfirmed?: boolean;
    isActive?: boolean;
    profilePictureUrl?: string;
    roleIds: string[];
  }): Observable<User> {
    this.isLoading.set(true);
    
    return this.api.post<any>(this.endpoint, user).pipe(
      tap(newUser => {
        const mappedUser = this.mapUserDtoToUser(newUser);
        const users = this.users();
        this.usersSubject.next([...users, mappedUser]);
        this.isLoading.set(false);
      }),
      map(user => this.mapUserDtoToUser(user))
    );
  }

  updateUser(id: string, user: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    isActive?: boolean;
    profilePictureUrl?: string;
    roleIds?: string[];
  }): Observable<User> {
    this.isLoading.set(true);
    
    return this.api.put<any>(`${this.endpoint}/${id}`, user).pipe(
      tap(updatedUser => {
        const mappedUser = this.mapUserDtoToUser(updatedUser);
        const users = this.users();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = mappedUser;
          this.usersSubject.next([...users]);
        }
        this.isLoading.set(false);
      }),
      map(user => this.mapUserDtoToUser(user))
    );
  }

  deleteUser(id: string): Observable<void> {
    this.isLoading.set(true);
    
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        const users = this.users().filter(u => u.id !== id);
        this.usersSubject.next(users);
        this.isLoading.set(false);
      })
    );
  }

  activateUser(id: string): Observable<void> {
    this.isLoading.set(true);
    
    return this.api.post<void>(`${this.endpoint}/${id}/activate`, {}).pipe(
      tap(() => {
        this.refreshUsers();
        this.isLoading.set(false);
      })
    );
  }

  deactivateUser(id: string): Observable<void> {
    this.isLoading.set(true);
    
    return this.api.post<void>(`${this.endpoint}/${id}/deactivate`, {}).pipe(
      tap(() => {
        this.refreshUsers();
        this.isLoading.set(false);
      })
    );
  }

  assignRolesToUser(userId: string, roleIds: string[]): Observable<void> {
    this.isLoading.set(true);
    
    return this.api.post<void>(`${this.endpoint}/${userId}/roles`, roleIds).pipe(
      tap(() => {
        this.refreshUsers();
        this.isLoading.set(false);
      })
    );
  }

  getUserRoles(userId: string): Observable<string[]> {
    return this.api.get<string[]>(`${this.endpoint}/${userId}/roles`);
  }

  // Mapping methods
  private mapUserDtoToUser(dto: any): User {
    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName || '',
      lastName: dto.lastName || '',
      phone: dto.phoneNumber,
      avatar: dto.profilePictureUrl,
      role: dto.roles && dto.roles.length > 0 ? {
        id: dto.roles[0],
        name: dto.roles[0],
        description: '',
        permissions: [],
        isSystemRole: false,
        isActive: true
      } : {
        id: '',
        name: 'No Role',
        description: '',
        permissions: [],
        isSystemRole: false,
        isActive: true
      },
      status: dto.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      profileCompleted: true,
      twoFactorEnabled: false,
      permissions: [],
      effectivePermissions: []
    };
  }

  private mapUserListDtoToUser(dto: any): User {
    // Backend returns roles as array of role name strings
    // Try both camelCase (from JSON serialization) and PascalCase (direct from DTO)
    const roleNames = dto.roles || dto.Roles || [];

    const firstRoleName = roleNames.length > 0 ? roleNames[0] : 'No Role';
    
    // Create user object with role names stored for component access
    const user: any = {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName || '',
      lastName: dto.lastName || '',
      phone: dto.phoneNumber,
      avatar: dto.profilePictureUrl,
      departmentId: dto.departmentId || dto.DepartmentId || undefined,
      role: {
        id: firstRoleName, // Using role name as ID temporarily (will be resolved when roles are loaded)
        name: firstRoleName,
        description: '',
        permissions: [],
        isSystemRole: false,
        isActive: true
      },
      status: dto.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      profileCompleted: true,
      twoFactorEnabled: false,
      permissions: [],
      effectivePermissions: []
    };
    
    // Store role names as a property that can be accessed by components
    user._roleNames = roleNames;
    user.roleNames = roleNames; // Also store as roleNames for easier access

    return user;
  }

  updateUserManager(id: string, managerId?: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);
    
    return this.api.post<{ success: boolean }>(`${this.endpoint}/${id}/manager`, {
      managerId
    }).pipe(
      tap(response => {
        if (response.success) {
          this.refreshUsers();
        }
        this.isLoading.set(false);
      })
    );
  }

  // User Invites
  inviteUser(invite: Partial<UserInvite>): Observable<UserInvite> {
    this.isLoading.set(true);
    
    return this.api.post<UserInvite>(`${this.endpoint}/invite`, invite).pipe(
      tap(newInvite => {
        const invites = this.invites();
        this.invitesSubject.next([...invites, newInvite]);
        this.isLoading.set(false);
      })
    );
  }

  getInvites(): Observable<UserInvite[]> {
    this.isLoading.set(true);
    
    return this.api.get<UserInvite[]>(`${this.endpoint}/invites`).pipe(
      tap(invites => {
        this.invitesSubject.next(invites);
        this.isLoading.set(false);
      })
    );
  }

  resendInvite(inviteId: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);
    
    return this.api.post<{ success: boolean }>(`${this.endpoint}/invites/${inviteId}/resend`, {}).pipe(
      tap(response => {
        this.isLoading.set(false);
      })
    );
  }

  revokeInvite(inviteId: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);
    
    return this.api.post<{ success: boolean }>(`${this.endpoint}/invites/${inviteId}/revoke`, {}).pipe(
      tap(response => {
        if (response.success) {
          const invites = this.invites();
          this.invitesSubject.next(invites.filter(i => i.id !== inviteId));
        }
        this.isLoading.set(false);
      })
    );
  }

  // Bulk Import
  importUsers(file: File, columnMapping: any): Observable<BulkImportResult> {
    this.isLoading.set(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(columnMapping));
    
    return this.api.post<BulkImportResult>(`${this.endpoint}/import`, formData).pipe(
      tap(response => {
        if (response.success) {
          this.refreshUsers();
        }
        this.isLoading.set(false);
      })
    );
  }

  previewImport(file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.api.post<any[]>(`${this.endpoint}/import/preview`, formData);
  }

  // Roles & Permissions

  getRoles(): Observable<UserRole[]> {
    this.isLoading.set(true);
    
    // Get all roles using pagination with a large pageSize
    // Note: Backend route is /api/Role, and apiBaseUrl already includes /api
    return this.api.getPaginated<any>('/Role', { 
      page: 1, 
      pageSize: 1000, // Get all roles
      isActive: true // Only get active roles for user assignment
    }).pipe(
      map(response => {
        // Map RoleListDto to UserRole
        return response.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          permissions: [], // Permissions not included in list DTO
          isSystemRole: role.isSystemRole || false,
          isActive: role.isActive !== undefined ? role.isActive : true
        }));
      }),
      tap(roles => {
        this.rolesSubject.next(roles);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        // Return empty array on error to prevent breaking the UI
        return of<UserRole[]>([]);
      })
    );
  }

  getUserEffectivePermissions(userId: string): Observable<string[]> {
    return this.api.get<string[]>(`${this.endpoint}/${userId}/permissions`);
  }

  /**
   * Get user statistics (for header cards)
   * Fetches counts for total, active, and inactive users
   */
  getUserStatistics(): Observable<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalRoles: number;
  }> {
    // Fetch all users and filtered counts in parallel for accurate statistics
    const allParams = { page: 1, pageSize: 10000 };
    const activeParams = { page: 1, pageSize: 10000, isActive: true };
    const inactiveParams = { page: 1, pageSize: 10000, isActive: false };

    return new Observable(observer => {
      forkJoin({
        all: this.getUsers(allParams),
        active: this.getUsers(activeParams),
        inactive: this.getUsers(inactiveParams),
        roles: this.getRoles()
      }).subscribe({
        next: (results) => {
          const statistics = {
            totalUsers: results.all.totalCount,
            activeUsers: results.active.totalCount,
            inactiveUsers: results.inactive.totalCount,
            totalRoles: results.roles.length
          };
          observer.next(statistics);
          observer.complete();
        },
        error: (error) => {
          // Fallback: try with just the all query
          forkJoin({
            all: this.getUsers(allParams),
            roles: this.getRoles()
          }).subscribe({
            next: (results) => {
              const allUsers = results.all.data;
              const statistics = {
                totalUsers: results.all.totalCount,
                activeUsers: allUsers.filter(u => u.status === 'ACTIVE').length,
                inactiveUsers: allUsers.filter(u => u.status !== 'ACTIVE').length,
                totalRoles: results.roles.length
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

  // Org Chart
  getOrgChart(): Observable<OrgChartNode[]> {
    this.isLoading.set(true);
    
    return this.api.get<OrgChartNode[]>('/v1/org-chart').pipe(
      tap(chart => {
        this.orgChartSubject.next(chart);
        this.isLoading.set(false);
      })
    );
  }

  // Approval Path Preview
  getApprovalPath(userId: string, requestType: string, sampleData?: any): Observable<ApprovalPath> {
    return this.api.post<ApprovalPath>(`${this.endpoint}/${userId}/approval-path`, {
      requestType,
      sampleData
    });
  }

  // Chat & Messaging
  getChatThreads(): Observable<ChatThread[]> {
    this.isLoading.set(true);
    
    return this.api.get<ChatThread[]>('/v1/chat/threads').pipe(
      tap(threads => {
        this.chatThreadsSubject.next(threads);
        this.isLoading.set(false);
      })
    );
  }

  createChatThread(participantIds: string[]): Observable<ChatThread> {
    this.isLoading.set(true);
    
    return this.api.post<ChatThread>('/v1/chat/threads', {
      participants: participantIds
    }).pipe(
      tap(newThread => {
        const threads = this.chatThreads();
        this.chatThreadsSubject.next([...threads, newThread]);
        this.isLoading.set(false);
      })
    );
  }

  getChatMessages(threadId: string, page?: number): Observable<{ messages: ChatMessage[]; hasMore: boolean }> {
    return this.api.get<{ messages: ChatMessage[]; hasMore: boolean }>(`/v1/chat/threads/${threadId}/messages`, {
      params: page ? { page: page.toString() } : {}
    });
  }

  sendMessage(threadId: string, content: string, attachments?: File[]): Observable<ChatMessage> {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments) {
      attachments.forEach(file => formData.append('attachments', file));
    }
    
    return this.api.post<ChatMessage>(`/v1/chat/threads/${threadId}/messages`, formData);
  }

  // Utility methods
  private refreshUsers(): void {
    this.getUsers({ page: 1, pageSize: 10 }).subscribe();
  }

  // Mock data for development
  getMockUsers(): User[] {
    return [
      {
        id: '1',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0123',
        role: { id: '1', name: 'Manager', description: 'Team Manager', permissions: ['read_users', 'manage_team'], isSystemRole: true, isActive: true },
        branchId: '1',
        orgUnitId: '1',
        designationId: '1',
        gradeId: '1',
        lineManagerId: '2',
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        profileCompleted: true,
        timezone: 'America/New_York',
        twoFactorEnabled: true,
        employeeId: 'EMP001',
        joiningDate: new Date('2023-01-15'),
        permissions: ['read_users', 'manage_team', 'approve_leave'],
        effectivePermissions: ['read_users', 'manage_team', 'approve_leave', 'view_reports']
      },
      {
        id: '2',
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0124',
        role: { id: '2', name: 'HR', description: 'Human Resources', permissions: ['manage_users', 'manage_roles'], isSystemRole: true, isActive: true },
        branchId: '1',
        orgUnitId: '2',
        designationId: '2',
        gradeId: '2',
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        profileCompleted: true,
        timezone: 'America/New_York',
        twoFactorEnabled: false,
        employeeId: 'EMP002',
        joiningDate: new Date('2022-06-01'),
        permissions: ['manage_users', 'manage_roles', 'view_all_reports'],
        effectivePermissions: ['manage_users', 'manage_roles', 'view_all_reports', 'approve_all']
      }
    ];
  }

  getMockRoles(): UserRole[] {
    return [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        permissions: ['*'],
        isSystemRole: true,
        isActive: true
      },
      {
        id: '2',
        name: 'HR',
        description: 'Human Resources management',
        permissions: ['manage_users', 'manage_roles', 'view_reports'],
        isSystemRole: true,
        isActive: true
      },
      {
        id: '3',
        name: 'Manager',
        description: 'Team management',
        permissions: ['manage_team', 'approve_leave', 'view_team_reports'],
        isSystemRole: true,
        isActive: true
      },
      {
        id: '4',
        name: 'Employee',
        description: 'Basic employee access',
        permissions: ['view_own_profile', 'submit_requests'],
        isSystemRole: true,
        isActive: true
      }
    ];
  }
}
