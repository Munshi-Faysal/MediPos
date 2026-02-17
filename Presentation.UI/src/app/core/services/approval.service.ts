import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface ApprovalRequest {
  id: string;
  subject: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  moduleType: 'LEAVE' | 'ADVANCE' | 'LOAN' | 'INCREMENT' | 'PROMOTION';
  currentStage: string;
  assignees: ApprovalAssignee[];
  sla: {
    dueDate: Date;
    isBreaching: boolean;
    daysRemaining: number;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
  payload: any;
  timeline: ApprovalTimelineItem[];
  comments: ApprovalComment[];
  attachments: ApprovalAttachment[];
  isRead: boolean;
  actionKey?: string; // For idempotency
}

export interface ApprovalAssignee {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  order: number;
  isRequired: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  actedAt?: Date;
  comment?: string;
}

export interface ApprovalTimelineItem {
  id: string;
  action: 'CREATED' | 'ASSIGNED' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'COMMENTED' | 'ATTACHMENT_ADDED';
  actorId: string;
  actorName: string;
  timestamp: Date;
  comment?: string;
  metadata?: any;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isSystem: boolean;
  mentions: string[];
  attachments: ApprovalAttachment[];
}

export interface ApprovalAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface InboxFilters {
  status?: string;
  moduleType?: string;
  assignedToMe?: boolean;
  slaBreaching?: boolean;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface InboxResponse {
  data: ApprovalRequest[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: InboxFilters;
}

export interface LeaveRequest {
  type: string;
  startDate: Date;
  endDate: Date;
  hours?: number;
  reason: string;
  attachments: File[];
  balance: {
    available: number;
    used: number;
    total: number;
  };
  rules: {
    maxConsecutiveDays: number;
    advanceNoticeDays: number;
    blackoutDates: Date[];
  };
}

export interface AdvanceRequest {
  amount: number;
  reason: string;
  tenure: number;
  policyLimit: number;
  dsr: number;
  repaymentSchedule: {
    installments: number;
    monthlyAmount: number;
  };
}

export interface LoanRequest {
  product: string;
  amount: number;
  tenure: number;
  purpose: string;
  dsr: number;
  eligibility: {
    isEligible: boolean;
    maxAmount: number;
    reasons: string[];
  };
}

export interface IncrementRequest {
  effectiveDate: Date;
  changeType: 'PERCENTAGE' | 'ABSOLUTE';
  changeValue: number;
  currentSalary: number;
  newSalary: number;
  proposedGrade?: string;
  proposedDesignation?: string;
  justification: string;
  performanceRating?: number;
}

export interface ApprovalAction {
  action: 'APPROVE' | 'REJECT' | 'RETURN';
  comment?: string;
  actionKey: string;
  notifyRequester?: boolean;
  notifyNextApprover?: boolean;
}

export interface BulkApprovalAction {
  requestIds: string[];
  action: 'APPROVE' | 'REJECT' | 'RETURN';
  comment?: string;
  actionKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  
  private inboxSubject = new BehaviorSubject<ApprovalRequest[]>([]);
  public unreadCountSubject = new BehaviorSubject<number>(0);
  private currentRequestSubject = new BehaviorSubject<ApprovalRequest | null>(null);
  
  // Signals for reactive programming
  public inbox = signal<ApprovalRequest[]>([]);
  public unreadCount = signal<number>(0);
  public currentRequest = signal<ApprovalRequest | null>(null);
  public isLoading = signal(false);

  constructor() {
    // Subscribe to subjects and update signals
    this.inboxSubject.subscribe(requests => this.inbox.set(requests));
    this.unreadCountSubject.subscribe(count => this.unreadCount.set(count));
    this.currentRequestSubject.subscribe(request => this.currentRequest.set(request));
  }

  // Inbox Management
  getInbox(params?: any): Observable<InboxResponse> {
    this.isLoading.set(true);
    
    return this.http.get<InboxResponse>(`${this.API_URL}/approval/inbox`, { params }).pipe(
      tap(response => {
        this.inboxSubject.next(response.data);
        this.updateUnreadCount();
        this.isLoading.set(false);
      })
    );
  }

  getInboxFilters(): Observable<InboxFilters> {
    return this.http.get<InboxFilters>(`${this.API_URL}/approval/inbox/filters`);
  }

  saveInboxView(viewName: string, filters: InboxFilters): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/approval/inbox/views`, {
      name: viewName,
      filters
    });
  }

  getSavedViews(): Observable<{ name: string; filters: InboxFilters }[]> {
    return this.http.get<{ name: string; filters: InboxFilters }[]>(`${this.API_URL}/approval/inbox/views`);
  }

  // Request Management
  getRequestById(id: string): Observable<ApprovalRequest> {
    this.isLoading.set(true);
    
    return this.http.get<ApprovalRequest>(`${this.API_URL}/approval/requests/${id}`).pipe(
      tap(request => {
        this.currentRequestSubject.next(request);
        this.isLoading.set(false);
      })
    );
  }

  createLeaveRequest(request: LeaveRequest): Observable<ApprovalRequest> {
    this.isLoading.set(true);
    
    return this.http.post<ApprovalRequest>(`${this.API_URL}/approval/requests/leave`, request).pipe(
      tap(newRequest => {
        this.isLoading.set(false);
      })
    );
  }

  createAdvanceRequest(request: AdvanceRequest): Observable<ApprovalRequest> {
    this.isLoading.set(true);
    
    return this.http.post<ApprovalRequest>(`${this.API_URL}/approval/requests/advance`, request).pipe(
      tap(newRequest => {
        this.isLoading.set(false);
      })
    );
  }

  createLoanRequest(request: LoanRequest): Observable<ApprovalRequest> {
    this.isLoading.set(true);
    
    return this.http.post<ApprovalRequest>(`${this.API_URL}/approval/requests/loan`, request).pipe(
      tap(newRequest => {
        this.isLoading.set(false);
      })
    );
  }

  createIncrementRequest(request: IncrementRequest): Observable<ApprovalRequest> {
    this.isLoading.set(true);
    
    return this.http.post<ApprovalRequest>(`${this.API_URL}/approval/requests/increment`, request).pipe(
      tap(newRequest => {
        this.isLoading.set(false);
      })
    );
  }

  // Approval Actions
  approveRequest(requestId: string, action: ApprovalAction): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/approval/requests/${requestId}/approve`, action).pipe(
      tap(response => {
        if (response.success) {
          this.refreshInbox();
        }
        this.isLoading.set(false);
      })
    );
  }

  rejectRequest(requestId: string, action: ApprovalAction): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/approval/requests/${requestId}/reject`, action).pipe(
      tap(response => {
        if (response.success) {
          this.refreshInbox();
        }
        this.isLoading.set(false);
      })
    );
  }

  returnRequest(requestId: string, action: ApprovalAction): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/approval/requests/${requestId}/return`, action).pipe(
      tap(response => {
        if (response.success) {
          this.refreshInbox();
        }
        this.isLoading.set(false);
      })
    );
  }

  bulkApprove(actions: BulkApprovalAction): Observable<{ success: boolean; message: string; results: any[] }> {
    this.isLoading.set(true);
    
    return this.http.post<{ success: boolean; message: string; results: any[] }>(`${this.API_URL}/approval/requests/bulk-approve`, actions).pipe(
      tap(response => {
        if (response.success) {
          this.refreshInbox();
        }
        this.isLoading.set(false);
      })
    );
  }

  // Comments and Timeline
  addComment(requestId: string, comment: string, mentions: string[] = []): Observable<ApprovalComment> {
    return this.http.post<ApprovalComment>(`${this.API_URL}/approval/requests/${requestId}/comments`, {
      content: comment,
      mentions
    });
  }

  getComments(requestId: string): Observable<ApprovalComment[]> {
    return this.http.get<ApprovalComment[]>(`${this.API_URL}/approval/requests/${requestId}/comments`);
  }

  getTimeline(requestId: string): Observable<ApprovalTimelineItem[]> {
    return this.http.get<ApprovalTimelineItem[]>(`${this.API_URL}/approval/requests/${requestId}/timeline`);
  }

  // Attachments
  uploadAttachment(requestId: string, file: File): Observable<ApprovalAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<ApprovalAttachment>(`${this.API_URL}/approval/requests/${requestId}/attachments`, formData);
  }

  deleteAttachment(requestId: string, attachmentId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/approval/requests/${requestId}/attachments/${attachmentId}`);
  }

  // Preview Approvers
  previewApprovers(requestType: string, payload: any): Observable<ApprovalAssignee[]> {
    return this.http.post<ApprovalAssignee[]>(`${this.API_URL}/approval/preview-approvers`, {
      requestType,
      payload
    });
  }

  // Utility methods
  private refreshInbox(): void {
    this.getInbox().subscribe();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.inbox().filter(request => !request.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  markAsRead(requestId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/approval/requests/${requestId}/mark-read`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.updateUnreadCount();
        }
      })
    );
  }

  // Mock data for development
  getMockInbox(): ApprovalRequest[] {
    return [
      {
        id: '1',
        subject: 'Bank Account Opening - ACC001',
        requesterId: '1',
        requesterName: 'Main Business Account',
        requesterEmail: 'business@company.com',
        moduleType: 'LOAN',
        currentStage: 'Manager Approval',
        assignees: [
          {
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@company.com',
            role: 'Account Manager',
            order: 1,
            isRequired: true,
            status: 'PENDING'
          }
        ],
        sla: {
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          isBreaching: false,
          daysRemaining: 2
        },
        status: 'PENDING',
        priority: 'MEDIUM',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        payload: {
          accountNumber: 'ACC001',
          accountName: 'Main Business Account',
          bankName: 'Chase Bank',
          accountType: 'Current',
          balance: '$125,000.50',
          status: 'Pending'
        },
        timeline: [],
        comments: [],
        attachments: [],
        isRead: false
      },
      {
        id: '2',
        subject: 'Bank Account Opening - ACC003',
        requesterId: '3',
        requesterName: 'Payroll Account',
        requesterEmail: 'payroll@company.com',
        moduleType: 'INCREMENT',
        currentStage: 'HR Approval',
        assignees: [
          {
            userId: '4',
            userName: 'Alice Williams',
            userEmail: 'alice.williams@company.com',
            role: 'HR Manager',
            order: 1,
            isRequired: true,
            status: 'PENDING'
          }
        ],
        sla: {
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isBreaching: true,
          daysRemaining: -1
        },
        status: 'PENDING',
        priority: 'HIGH',
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-10'),
        payload: {
          accountNumber: 'ACC003',
          accountName: 'Payroll Account',
          bankName: 'Wells Fargo',
          accountType: 'Current',
          balance: '$75,000.25',
          status: 'Pending'
        },
        timeline: [],
        comments: [],
        attachments: [],
        isRead: false
      },
      {
        id: '3',
        subject: 'Bank Account Opening - ACC004',
        requesterId: '4',
        requesterName: 'Investment Account',
        requesterEmail: 'investment@company.com',
        moduleType: 'PROMOTION',
        currentStage: 'Finance Approval',
        assignees: [
          {
            userId: '5',
            userName: 'Michael Brown',
            userEmail: 'michael.brown@company.com',
            role: 'Finance Manager',
            order: 1,
            isRequired: true,
            status: 'PENDING'
          }
        ],
        sla: {
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isBreaching: false,
          daysRemaining: 3
        },
        status: 'PENDING',
        priority: 'LOW',
        createdAt: new Date('2023-04-05'),
        updatedAt: new Date('2023-04-05'),
        payload: {
          accountNumber: 'ACC004',
          accountName: 'Investment Account',
          bankName: 'Citibank',
          accountType: 'Investment',
          balance: '$200,000.75',
          status: 'Pending'
        },
        timeline: [],
        comments: [],
        attachments: [],
        isRead: true
      },
      {
        id: '4',
        subject: 'Bank Account Opening - ACC005',
        requesterId: '5',
        requesterName: 'Temporary Account',
        requesterEmail: 'temp@company.com',
        moduleType: 'LOAN',
        currentStage: 'Manager Approval',
        assignees: [
          {
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@company.com',
            role: 'Account Manager',
            order: 1,
            isRequired: true,
            status: 'PENDING'
          }
        ],
        sla: {
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          isBreaching: false,
          daysRemaining: 1
        },
        status: 'PENDING',
        priority: 'MEDIUM',
        createdAt: new Date('2023-05-12'),
        updatedAt: new Date('2023-05-12'),
        payload: {
          accountNumber: 'ACC005',
          accountName: 'Temporary Account',
          bankName: 'PNC Bank',
          accountType: 'Current',
          balance: '$15,000.00',
          status: 'Pending'
        },
        timeline: [],
        comments: [],
        attachments: [],
        isRead: false
      },
      {
        id: '5',
        subject: 'Bank Account Opening - ACC009',
        requesterId: '9',
        requesterName: 'Rejected Account',
        requesterEmail: 'rejected@company.com',
        moduleType: 'ADVANCE',
        currentStage: 'Final Review',
        assignees: [
          {
            userId: '6',
            userName: 'David Wilson',
            userEmail: 'david.wilson@company.com',
            role: 'Senior Manager',
            order: 1,
            isRequired: true,
            status: 'REJECTED'
          }
        ],
        sla: {
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isBreaching: true,
          daysRemaining: -5
        },
        status: 'REJECTED',
        priority: 'HIGH',
        createdAt: new Date('2023-07-15'),
        updatedAt: new Date('2023-07-15'),
        payload: {
          accountNumber: 'ACC009',
          accountName: 'Rejected Account',
          bankName: 'TD Bank',
          accountType: 'Current',
          balance: '$0.00',
          status: 'Rejected'
        },
        timeline: [],
        comments: [],
        attachments: [],
        isRead: true
      }
    ];
  }

  getMockCannedTemplates(): string[] {
    return [
      'Missing required documentation',
      'Policy mismatch - please review',
      'Insufficient justification provided',
      'Amount exceeds policy limits',
      'Please provide additional details',
      'Approved with conditions',
      'Requires higher level approval'
    ];
  }
}
