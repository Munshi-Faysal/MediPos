import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
  route: string;
  icon: string;
}

export interface OnboardingProgress {
  id: string;
  tenantId: string;
  steps: OnboardingStep[];
  currentStep: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  timezone: string;
  workingWeekPattern: 'MON_FRI' | 'MON_SAT' | 'SUN_THU' | 'CUSTOM';
  holidayCalendar: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgUnit {
  id: string;
  name: string;
  type: 'COMPANY' | 'DIVISION' | 'DEPARTMENT' | 'TEAM';
  parentId?: string;
  branchId?: string;
  costCenter?: string;
  managerId?: string;
  children: OrgUnit[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Designation {
  id: string;
  title: string;
  description: string;
  defaultGradeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  level: number;
  name: string;
  minCompensation: number;
  maxCompensation: number;
  colorTag: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalPolicy {
  id: string;
  name: string;
  description: string;
  type: 'LEAVE' | 'ADVANCE' | 'LOAN' | 'INCREMENT' | 'PROMOTION' | 'CUSTOM';
  stages: ApprovalStage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStage {
  id: string;
  order: number;
  type: 'LINE_MANAGER' | 'SECONDARY' | 'ROLE' | 'USER' | 'CONDITIONAL';
  roleId?: string;
  userId?: string;
  condition?: string;
  isRequired: boolean;
  timeoutHours?: number;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  cutoffDate: Date;
  paydayDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'PROCESSING' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollCalendar {
  id: string;
  name: string;
  periodType: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';
  periodStartDay: number;
  cutoffDay: number;
  paydayRule: string;
  periods: PayrollPeriod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string;
  isPaid: boolean;
  allowsHalfDay: boolean;
  allowsHourly: boolean;
  requiresMedicalCert: boolean;
  maxDaysPerYear?: number;
  accrualRate?: number;
  carryoverLimit?: number;
  carryoverExpiry?: number;
  allowsEncashment: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeavePolicy {
  id: string;
  leaveTypeId: string;
  branchId?: string;
  gradeId?: string;
  accrualRate: number;
  carryoverLimit: number;
  carryoverExpiry: number;
  allowsEncashment: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private api = inject(ApiService);
  private http = inject(HttpClient);


  private progressSubject = new BehaviorSubject<OnboardingProgress | null>(null);
  private branchesSubject = new BehaviorSubject<Branch[]>([]);
  private orgUnitsSubject = new BehaviorSubject<OrgUnit[]>([]);
  private designationsSubject = new BehaviorSubject<Designation[]>([]);
  private gradesSubject = new BehaviorSubject<Grade[]>([]);
  private approvalPoliciesSubject = new BehaviorSubject<ApprovalPolicy[]>([]);
  private payrollCalendarSubject = new BehaviorSubject<PayrollCalendar | null>(null);
  private leaveTypesSubject = new BehaviorSubject<LeaveType[]>([]);
  private leavePoliciesSubject = new BehaviorSubject<LeavePolicy[]>([]);

  // Signals for reactive programming
  public progress = signal<OnboardingProgress | null>(null);
  public branches = signal<Branch[]>([]);
  public orgUnits = signal<OrgUnit[]>([]);
  public designations = signal<Designation[]>([]);
  public grades = signal<Grade[]>([]);
  public approvalPolicies = signal<ApprovalPolicy[]>([]);
  public payrollCalendar = signal<PayrollCalendar | null>(null);
  public leaveTypes = signal<LeaveType[]>([]);
  public leavePolicies = signal<LeavePolicy[]>([]);
  public isLoading = signal(false);

  constructor() {
    // Subscribe to subjects and update signals
    this.progressSubject.subscribe(progress => this.progress.set(progress));
    this.branchesSubject.subscribe(branches => this.branches.set(branches));
    this.orgUnitsSubject.subscribe(orgUnits => this.orgUnits.set(orgUnits));
    this.designationsSubject.subscribe(designations => this.designations.set(designations));
    this.gradesSubject.subscribe(grades => this.grades.set(grades));
    this.approvalPoliciesSubject.subscribe(policies => this.approvalPolicies.set(policies));
    this.payrollCalendarSubject.subscribe(calendar => this.payrollCalendar.set(calendar));
    this.leaveTypesSubject.subscribe(types => this.leaveTypes.set(types));
    this.leavePoliciesSubject.subscribe(policies => this.leavePolicies.set(policies));
  }

  // Onboarding Progress
  getOnboardingProgress(tenantId: string): Observable<OnboardingProgress> {
    this.isLoading.set(true);

    return this.api.get<OnboardingProgress>(`/onboarding/${tenantId}/progress`).pipe(
      tap(progress => {
        this.progressSubject.next(progress);
        this.isLoading.set(false);
      })
    );
  }

  completeOnboardingStep(tenantId: string, stepId: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);

    return this.api.post<{ success: boolean }>(`/onboarding/${tenantId}/steps/${stepId}/complete`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.refreshProgress(tenantId);
        }
        this.isLoading.set(false);
      })
    );
  }

  // Branches
  getBranches(tenantId: string, params?: any): Observable<{ data: Branch[]; total: number }> {
    this.isLoading.set(true);

    return this.api.get<{ data: Branch[]; total: number }>(`/onboarding/${tenantId}/branches`, { params }).pipe(
      tap(response => {
        this.branchesSubject.next(response.data);
        this.isLoading.set(false);
      })
    );
  }

  createBranch(tenantId: string, branch: Partial<Branch>): Observable<Branch> {
    this.isLoading.set(true);

    return this.api.post<Branch>(`/onboarding/${tenantId}/branches`, branch).pipe(
      tap(newBranch => {
        const branches = this.branches();
        this.branchesSubject.next([...branches, newBranch]);
        this.isLoading.set(false);
      })
    );
  }

  updateBranch(tenantId: string, branchId: string, branch: Partial<Branch>): Observable<Branch> {
    this.isLoading.set(true);

    return this.api.put<Branch>(`/onboarding/${tenantId}/branches/${branchId}`, branch).pipe(
      tap(updatedBranch => {
        const branches = this.branches();
        const index = branches.findIndex(b => b.id === branchId);
        if (index !== -1) {
          branches[index] = updatedBranch;
          this.branchesSubject.next([...branches]);
        }
        this.isLoading.set(false);
      })
    );
  }

  deleteBranch(tenantId: string, branchId: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);

    return this.api.delete<{ success: boolean }>(`/onboarding/${tenantId}/branches/${branchId}`).pipe(
      tap(response => {
        if (response.success) {
          const branches = this.branches();
          this.branchesSubject.next(branches.filter(b => b.id !== branchId));
        }
        this.isLoading.set(false);
      })
    );
  }

  importBranches(tenantId: string, file: File): Observable<{ success: boolean; imported: number; errors: string[] }> {
    this.isLoading.set(true);

    return this.api.upload<{ success: boolean; imported: number; errors: string[] }>(`/onboarding/${tenantId}/branches/import`, file).pipe(
      tap(response => {
        if (response.success) {
          this.refreshBranches(tenantId);
        }
        this.isLoading.set(false);
      })
    );
  }

  // Org Units
  getOrgUnits(tenantId: string): Observable<OrgUnit[]> {
    this.isLoading.set(true);

    return this.api.get<OrgUnit[]>(`/onboarding/${tenantId}/org-units`).pipe(
      tap(orgUnits => {
        this.orgUnitsSubject.next(orgUnits);
        this.isLoading.set(false);
      })
    );
  }

  createOrgUnit(tenantId: string, orgUnit: Partial<OrgUnit>): Observable<OrgUnit> {
    this.isLoading.set(true);

    return this.api.post<OrgUnit>(`/onboarding/${tenantId}/org-units`, orgUnit).pipe(
      tap(newOrgUnit => {
        this.refreshOrgUnits(tenantId);
        this.isLoading.set(false);
      })
    );
  }

  updateOrgUnit(tenantId: string, orgUnitId: string, orgUnit: Partial<OrgUnit>): Observable<OrgUnit> {
    this.isLoading.set(true);

    return this.api.put<OrgUnit>(`/onboarding/${tenantId}/org-units/${orgUnitId}`, orgUnit).pipe(
      tap(updatedOrgUnit => {
        this.refreshOrgUnits(tenantId);
        this.isLoading.set(false);
      })
    );
  }

  moveOrgUnit(tenantId: string, orgUnitId: string, newParentId?: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);

    return this.api.post<{ success: boolean }>(`/onboarding/${tenantId}/org-units/${orgUnitId}/move`, {
      newParentId
    }).pipe(
      tap(response => {
        if (response.success) {
          this.refreshOrgUnits(tenantId);
        }
        this.isLoading.set(false);
      })
    );
  }

  // Designations & Grades
  getDesignations(tenantId: string): Observable<Designation[]> {
    this.isLoading.set(true);

    return this.api.get<Designation[]>(`/onboarding/${tenantId}/designations`).pipe(
      tap(designations => {
        this.designationsSubject.next(designations);
        this.isLoading.set(false);
      })
    );
  }

  createDesignation(tenantId: string, designation: Partial<Designation>): Observable<Designation> {
    this.isLoading.set(true);

    return this.api.post<Designation>(`/onboarding/${tenantId}/designations`, designation).pipe(
      tap(newDesignation => {
        const designations = this.designations();
        this.designationsSubject.next([...designations, newDesignation]);
        this.isLoading.set(false);
      })
    );
  }

  getGrades(tenantId: string): Observable<Grade[]> {
    this.isLoading.set(true);

    return this.api.get<Grade[]>(`/onboarding/${tenantId}/grades`).pipe(
      tap(grades => {
        this.gradesSubject.next(grades);
        this.isLoading.set(false);
      })
    );
  }

  createGrade(tenantId: string, grade: Partial<Grade>): Observable<Grade> {
    this.isLoading.set(true);

    return this.api.post<Grade>(`/onboarding/${tenantId}/grades`, grade).pipe(
      tap(newGrade => {
        const grades = this.grades();
        this.gradesSubject.next([...grades, newGrade]);
        this.isLoading.set(false);
      })
    );
  }

  // Approval Policies
  getApprovalPolicies(tenantId: string): Observable<ApprovalPolicy[]> {
    this.isLoading.set(true);

    return this.api.get<ApprovalPolicy[]>(`/onboarding/${tenantId}/approval-policies`).pipe(
      tap(policies => {
        this.approvalPoliciesSubject.next(policies);
        this.isLoading.set(false);
      })
    );
  }

  createApprovalPolicy(tenantId: string, policy: Partial<ApprovalPolicy>): Observable<ApprovalPolicy> {
    this.isLoading.set(true);

    return this.api.post<ApprovalPolicy>(`/onboarding/${tenantId}/approval-policies`, policy).pipe(
      tap(newPolicy => {
        const policies = this.approvalPolicies();
        this.approvalPoliciesSubject.next([...policies, newPolicy]);
        this.isLoading.set(false);
      })
    );
  }

  testApprovalPolicy(tenantId: string, policyId: string, testData: any): Observable<{ approvers: any[]; path: any[] }> {
    return this.api.post<{ approvers: any[]; path: any[] }>(`/onboarding/${tenantId}/approval-policies/${policyId}/test`, testData);
  }

  // Payroll Calendar
  getPayrollCalendar(tenantId: string): Observable<PayrollCalendar> {
    this.isLoading.set(true);

    return this.api.get<PayrollCalendar>(`/onboarding/${tenantId}/payroll-calendar`).pipe(
      tap(calendar => {
        this.payrollCalendarSubject.next(calendar);
        this.isLoading.set(false);
      })
    );
  }

  updatePayrollCalendar(tenantId: string, calendar: Partial<PayrollCalendar>): Observable<PayrollCalendar> {
    this.isLoading.set(true);

    return this.api.put<PayrollCalendar>(`/onboarding/${tenantId}/payroll-calendar`, calendar).pipe(
      tap(updatedCalendar => {
        this.payrollCalendarSubject.next(updatedCalendar);
        this.isLoading.set(false);
      })
    );
  }

  generatePayrollPeriods(tenantId: string, months: number): Observable<PayrollPeriod[]> {
    return this.api.post<PayrollPeriod[]>(`/onboarding/${tenantId}/payroll-calendar/generate-periods`, {
      months
    });
  }

  // Leave Setup
  getLeaveTypes(tenantId: string): Observable<LeaveType[]> {
    this.isLoading.set(true);

    return this.api.get<LeaveType[]>(`/onboarding/${tenantId}/leave-types`).pipe(
      tap(types => {
        this.leaveTypesSubject.next(types);
        this.isLoading.set(false);
      })
    );
  }

  createLeaveType(tenantId: string, leaveType: Partial<LeaveType>): Observable<LeaveType> {
    this.isLoading.set(true);

    return this.api.post<LeaveType>(`/onboarding/${tenantId}/leave-types`, leaveType).pipe(
      tap(newLeaveType => {
        const types = this.leaveTypes();
        this.leaveTypesSubject.next([...types, newLeaveType]);
        this.isLoading.set(false);
      })
    );
  }

  getLeavePolicies(tenantId: string): Observable<LeavePolicy[]> {
    this.isLoading.set(true);

    return this.api.get<LeavePolicy[]>(`/onboarding/${tenantId}/leave-policies`).pipe(
      tap(policies => {
        this.leavePoliciesSubject.next(policies);
        this.isLoading.set(false);
      })
    );
  }

  createLeavePolicy(tenantId: string, policy: Partial<LeavePolicy>): Observable<LeavePolicy> {
    this.isLoading.set(true);

    return this.api.post<LeavePolicy>(`/onboarding/${tenantId}/leave-policies`, policy).pipe(
      tap(newPolicy => {
        const policies = this.leavePolicies();
        this.leavePoliciesSubject.next([...policies, newPolicy]);
        this.isLoading.set(false);
      })
    );
  }

  simulateLeaveAccrual(tenantId: string, employeeData: any): Observable<{ accruals: any[]; balances: any[] }> {
    return this.api.post<{ accruals: any[]; balances: any[] }>(`/onboarding/${tenantId}/leave-policies/simulate`, employeeData);
  }

  // Utility methods
  private refreshProgress(tenantId: string): void {
    this.getOnboardingProgress(tenantId).subscribe();
  }

  private refreshBranches(tenantId: string): void {
    this.getBranches(tenantId).subscribe();
  }

  private refreshOrgUnits(tenantId: string): void {
    this.getOrgUnits(tenantId).subscribe();
  }

  // Mock data for development
  getMockOnboardingSteps(): OnboardingStep[] {
    return [
      {
        id: 'branches',
        title: 'Branch Profiles',
        description: 'Configure branch names and locations',
        completed: false,
        required: true,
        order: 1,
        route: '/app/settings/onboarding/branches',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
      },
      {
        id: 'orgUnits',
        title: 'Organization Units',
        description: 'Set up departments and designations',
        completed: false,
        required: true,
        order: 2,
        route: '/app/settings/onboarding/org-units',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      },
      {
        id: 'designations',
        title: 'Designations & Grades',
        description: 'Define employee designations and grade levels',
        completed: false,
        required: true,
        order: 3,
        route: '/app/settings/onboarding/designations',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      },
      {
        id: 'approvalPolicies',
        title: 'Approval Policies',
        description: 'Configure approval workflows',
        completed: false,
        required: true,
        order: 4,
        route: '/app/settings/onboarding/approval-policies',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
      },
      {
        id: 'payrollCalendar',
        title: 'Payroll Calendar',
        description: 'Set up payroll processing schedule',
        completed: false,
        required: true,
        order: 5,
        route: '/app/settings/onboarding/payroll-calendar',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        id: 'leaveSetup',
        title: 'Leave Setup',
        description: 'Configure leave types and policies',
        completed: false,
        required: true,
        order: 6,
        route: '/app/settings/onboarding/leave-setup',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        id: 'inviteUsers',
        title: 'Invite Users',
        description: 'Add team members to your organization',
        completed: false,
        required: false,
        order: 7,
        route: '/app/settings/onboarding/invite-users',
        icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
      }
    ];
  }
}

