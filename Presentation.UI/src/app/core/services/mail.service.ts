import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, retry } from 'rxjs/operators';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: EmailVariable[];
  category: EmailCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface EmailVariable {
  key: string;
  label: string;
  type: 'text' | 'url' | 'date' | 'number' | 'boolean';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface EmailCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface EmailJob {
  id: string;
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  variables: Record<string, any>;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTest {
  templateId: string;
  recipientEmail: string;
  variables: Record<string, any>;
  previewMode: 'light' | 'dark';
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  bounceRate: number;
  openRate: number;
  clickRate: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);
  private jobsSubject = new BehaviorSubject<EmailJob[]>([]);
  private statsSubject = new BehaviorSubject<EmailStats | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive programming
  public templates = signal<EmailTemplate[]>([]);
  public jobs = signal<EmailJob[]>([]);
  public stats = signal<EmailStats | null>(null);
  public isLoading = signal<boolean>(false);

  constructor() {
    // Subscribe to subjects and update signals
    this.templatesSubject.subscribe(templates => this.templates.set(templates));
    this.jobsSubject.subscribe(jobs => this.jobs.set(jobs));
    this.statsSubject.subscribe(stats => this.stats.set(stats));
    this.isLoadingSubject.subscribe(loading => this.isLoading.set(loading));
  }

  // Template Management
  getTemplates(): Observable<EmailTemplate[]> {
    this.isLoadingSubject.next(true);
    
    return this.http.get<EmailTemplate[]>(`${this.API_URL}/mail/templates`).pipe(
      tap(templates => {
        this.templatesSubject.next(templates);
        this.isLoadingSubject.next(false);
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  getTemplate(templateId: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.API_URL}/mail/templates/${templateId}`);
  }

  createTemplate(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<EmailTemplate>(`${this.API_URL}/mail/templates`, template).pipe(
      tap(newTemplate => {
        const currentTemplates = this.templates();
        this.templatesSubject.next([newTemplate, ...currentTemplates]);
        this.isLoadingSubject.next(false);
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Observable<EmailTemplate> {
    this.isLoadingSubject.next(true);
    
    return this.http.put<EmailTemplate>(`${this.API_URL}/mail/templates/${templateId}`, updates).pipe(
      tap(updatedTemplate => {
        const currentTemplates = this.templates();
        const index = currentTemplates.findIndex(t => t.id === templateId);
        if (index !== -1) {
          currentTemplates[index] = updatedTemplate;
          this.templatesSubject.next([...currentTemplates]);
        }
        this.isLoadingSubject.next(false);
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  deleteTemplate(templateId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/mail/templates/${templateId}`).pipe(
      tap(response => {
        if (response.success) {
          const currentTemplates = this.templates();
          this.templatesSubject.next(currentTemplates.filter(t => t.id !== templateId));
        }
      })
    );
  }

  // Template Testing
  testTemplate(testData: EmailTest): Observable<{ success: boolean; previewUrl?: string }> {
    return this.http.post<{ success: boolean; previewUrl?: string }>(`${this.API_URL}/mail/templates/test`, testData);
  }

  validateTemplate(templateId: string, variables: Record<string, any>): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(`${this.API_URL}/mail/templates/${templateId}/validate`, { variables });
  }

  // Email Jobs
  getJobs(params?: any): Observable<{ jobs: EmailJob[]; total: number; hasMore: boolean }> {
    this.isLoadingSubject.next(true);
    
    return this.http.get<{ jobs: EmailJob[]; total: number; hasMore: boolean }>(`${this.API_URL}/mail/jobs`, { params }).pipe(
      tap(response => {
        this.jobsSubject.next(response.jobs);
        this.isLoadingSubject.next(false);
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  getJob(jobId: string): Observable<EmailJob> {
    return this.http.get<EmailJob>(`${this.API_URL}/mail/jobs/${jobId}`);
  }

  retryJob(jobId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/mail/jobs/${jobId}/retry`, {});
  }

  cancelJob(jobId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/mail/jobs/${jobId}/cancel`, {});
  }

  // Email Queue
  queueEmail(emailData: {
    templateId: string;
    recipientEmail: string;
    recipientName: string;
    variables: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
  }): Observable<{ success: boolean; jobId: string }> {
    return this.http.post<{ success: boolean; jobId: string }>(`${this.API_URL}/mail/queue`, emailData);
  }

  // Statistics
  getStats(): Observable<EmailStats> {
    return this.http.get<EmailStats>(`${this.API_URL}/mail/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // Template Categories
  getCategories(): Observable<EmailCategory[]> {
    return this.http.get<EmailCategory[]>(`${this.API_URL}/mail/categories`);
  }

  // Mock data for development
  getMockTemplates(): EmailTemplate[] {
    return [
      {
        id: '1',
        name: 'Company Registration Submitted',
        subject: 'Registration Submitted - {{company.name}}',
        htmlContent: this.getMockHtmlContent('registration-submitted'),
        textContent: this.getMockTextContent('registration-submitted'),
        variables: [
          { key: 'company.name', label: 'Company Name', type: 'text', required: true },
          { key: 'company.domain', label: 'Company Domain', type: 'text', required: true },
          { key: 'owner.name', label: 'Owner Name', type: 'text', required: true },
          { key: 'registration.url', label: 'Registration URL', type: 'url', required: true }
        ],
        category: { id: 'registration', name: 'Registration', description: 'Company registration emails', icon: 'building' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 15
      },
      {
        id: '2',
        name: 'Leave Request Approved',
        subject: 'Leave Request Approved - {{employee.name}}',
        htmlContent: this.getMockHtmlContent('leave-approved'),
        textContent: this.getMockTextContent('leave-approved'),
        variables: [
          { key: 'employee.name', label: 'Employee Name', type: 'text', required: true },
          { key: 'leave.type', label: 'Leave Type', type: 'text', required: true },
          { key: 'leave.startDate', label: 'Start Date', type: 'date', required: true },
          { key: 'leave.endDate', label: 'End Date', type: 'date', required: true },
          { key: 'approver.name', label: 'Approver Name', type: 'text', required: true }
        ],
        category: { id: 'leave', name: 'Leave Management', description: 'Leave request emails', icon: 'calendar' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 42
      },
      {
        id: '3',
        name: 'User Invitation',
        subject: 'You\'re invited to join {{company.name}}',
        htmlContent: this.getMockHtmlContent('user-invitation'),
        textContent: this.getMockTextContent('user-invitation'),
        variables: [
          { key: 'company.name', label: 'Company Name', type: 'text', required: true },
          { key: 'inviter.name', label: 'Inviter Name', type: 'text', required: true },
          { key: 'invitation.url', label: 'Invitation URL', type: 'url', required: true },
          { key: 'role', label: 'Role', type: 'text', required: true }
        ],
        category: { id: 'user', name: 'User Management', description: 'User invitation emails', icon: 'user-plus' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 28
      }
    ];
  }

  getMockJobs(): EmailJob[] {
    return [
      {
        id: '1',
        templateId: '1',
        recipientEmail: 'john.doe@company.com',
        recipientName: 'John Doe',
        variables: {
          'company.name': 'TechCorp Inc.',
          'company.domain': 'techcorp.com',
          'owner.name': 'John Doe',
          'registration.url': 'https://app.techcorp.com/register/status/abc123'
        },
        status: 'sent',
        priority: 'normal',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '2',
        templateId: '2',
        recipientEmail: 'jane.smith@company.com',
        recipientName: 'Jane Smith',
        variables: {
          'employee.name': 'Jane Smith',
          'leave.type': 'Annual Leave',
          'leave.startDate': '2024-02-15',
          'leave.endDate': '2024-02-20',
          'approver.name': 'Bob Johnson'
        },
        status: 'queued',
        priority: 'normal',
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '3',
        templateId: '3',
        recipientEmail: 'invalid@email.com',
        recipientName: 'Invalid User',
        variables: {
          'company.name': 'TechCorp Inc.',
          'inviter.name': 'John Doe',
          'invitation.url': 'https://app.techcorp.com/invite/xyz789',
          'role': 'Employee'
        },
        status: 'failed',
        priority: 'normal',
        failedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        errorMessage: 'Invalid email address',
        retryCount: 3,
        maxRetries: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];
  }

  getMockStats(): EmailStats {
    return {
      totalSent: 1250,
      totalDelivered: 1180,
      totalFailed: 70,
      deliveryRate: 94.4,
      bounceRate: 2.8,
      openRate: 68.5,
      clickRate: 12.3,
      lastUpdated: new Date()
    };
  }

  private getMockHtmlContent(templateType: string): string {
    const templates: Record<string, string> = {
      'registration-submitted': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Submitted</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Registration Submitted</h1>
            <p>Dear {{owner.name}},</p>
            <p>Thank you for submitting your registration for <strong>{{company.name}}</strong>.</p>
            <p>Your registration is now under review. We'll notify you once it's been processed.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Registration Details:</h3>
              <ul>
                <li><strong>Company:</strong> {{company.name}}</li>
                <li><strong>Domain:</strong> {{company.domain}}</li>
                <li><strong>Owner:</strong> {{owner.name}}</li>
              </ul>
            </div>
            <p>You can check your registration status at any time:</p>
            <a href="{{registration.url}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Check Status</a>
            <p style="margin-top: 30px;">Best regards,<br>The HRM Team</p>
          </div>
        </body>
        </html>
      `,
      'leave-approved': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Leave Request Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #059669;">Leave Request Approved</h1>
            <p>Dear {{employee.name}},</p>
            <p>Great news! Your leave request has been approved.</p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3>Leave Details:</h3>
              <ul>
                <li><strong>Type:</strong> {{leave.type}}</li>
                <li><strong>Start Date:</strong> {{leave.startDate}}</li>
                <li><strong>End Date:</strong> {{leave.endDate}}</li>
                <li><strong>Approved by:</strong> {{approver.name}}</li>
              </ul>
            </div>
            <p>Please ensure you've completed any necessary handovers before your leave begins.</p>
            <p style="margin-top: 30px;">Best regards,<br>{{approver.name}}</p>
          </div>
        </body>
        </html>
      `,
      'user-invitation': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">You're Invited!</h1>
            <p>Hello!</p>
            <p><strong>{{inviter.name}}</strong> has invited you to join <strong>{{company.name}}</strong> as a <strong>{{role}}</strong>.</p>
            <p>Click the button below to accept your invitation and get started:</p>
            <a href="{{invitation.url}}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
            <p style="margin-top: 30px;">If you have any questions, please don't hesitate to reach out to {{inviter.name}}.</p>
            <p>Best regards,<br>The {{company.name}} Team</p>
          </div>
        </body>
        </html>
      `
    };
    
    return templates[templateType] || '';
  }

  private getMockTextContent(templateType: string): string {
    const templates: Record<string, string> = {
      'registration-submitted': `
        Registration Submitted
        
        Dear {{owner.name}},
        
        Thank you for submitting your registration for {{company.name}}.
        
        Your registration is now under review. We'll notify you once it's been processed.
        
        Registration Details:
        - Company: {{company.name}}
        - Domain: {{company.domain}}
        - Owner: {{owner.name}}
        
        You can check your registration status at any time: {{registration.url}}
        
        Best regards,
        The HRM Team
      `,
      'leave-approved': `
        Leave Request Approved
        
        Dear {{employee.name}},
        
        Great news! Your leave request has been approved.
        
        Leave Details:
        - Type: {{leave.type}}
        - Start Date: {{leave.startDate}}
        - End Date: {{leave.endDate}}
        - Approved by: {{approver.name}}
        
        Please ensure you've completed any necessary handovers before your leave begins.
        
        Best regards,
        {{approver.name}}
      `,
      'user-invitation': `
        You're Invited!
        
        Hello!
        
        {{inviter.name}} has invited you to join {{company.name}} as a {{role}}.
        
        Click the link below to accept your invitation and get started:
        {{invitation.url}}
        
        If you have any questions, please don't hesitate to reach out to {{inviter.name}}.
        
        Best regards,
        The {{company.name}} Team
      `
    };
    
    return templates[templateType] || '';
  }
}
