import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  type: 'approval' | 'rejection' | 'welcome' | 'invitation' | 'notification';
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailPreview {
  template: EmailTemplate;
  previewData: any;
  lightMode: string;
  darkMode: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api/v1';
  
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);
  
  // Signals for reactive programming
  public templates = signal<EmailTemplate[]>([]);
  public isLoading = signal(false);

  constructor() {
    this.templatesSubject.subscribe(templates => {
      this.templates.set(templates);
    });
  }

  // Template management
  getTemplates(): Observable<EmailTemplate[]> {
    this.isLoading.set(true);
    
    return this.http.get<EmailTemplate[]>(`${this.API_URL}/email-templates`).pipe(
      tap(templates => {
        this.templatesSubject.next(templates);
        this.isLoading.set(false);
      })
    );
  }

  getTemplateById(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.API_URL}/email-templates/${id}`);
  }

  createTemplate(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    this.isLoading.set(true);
    
    return this.http.post<EmailTemplate>(`${this.API_URL}/email-templates`, template).pipe(
      tap(newTemplate => {
        const templates = this.templates();
        this.templatesSubject.next([...templates, newTemplate]);
        this.isLoading.set(false);
      })
    );
  }

  updateTemplate(id: string, template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    this.isLoading.set(true);
    
    return this.http.put<EmailTemplate>(`${this.API_URL}/email-templates/${id}`, template).pipe(
      tap(updatedTemplate => {
        const templates = this.templates();
        const index = templates.findIndex(t => t.id === id);
        if (index !== -1) {
          templates[index] = updatedTemplate;
          this.templatesSubject.next([...templates]);
        }
        this.isLoading.set(false);
      })
    );
  }

  deleteTemplate(id: string): Observable<{ success: boolean }> {
    this.isLoading.set(true);
    
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/email-templates/${id}`).pipe(
      tap(response => {
        if (response.success) {
          const templates = this.templates();
          this.templatesSubject.next(templates.filter(t => t.id !== id));
        }
        this.isLoading.set(false);
      })
    );
  }

  // Preview functionality
  previewTemplate(templateId: string, previewData: any): Observable<EmailPreview> {
    return this.http.post<EmailPreview>(`${this.API_URL}/email-templates/${templateId}/preview`, {
      previewData
    });
  }

  // Send test email
  sendTestEmail(templateId: string, recipientEmail: string, previewData: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/email-templates/${templateId}/send-test`, {
      recipientEmail,
      previewData
    });
  }

  // Template variables
  getTemplateVariables(templateType: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/email-templates/variables/${templateType}`);
  }

  // Utility methods
  getTemplatesObservable(): Observable<EmailTemplate[]> {
    return this.templatesSubject.asObservable();
  }

  // Mock data for development
  getMockTemplates(): EmailTemplate[] {
    return [
      {
        id: '1',
        name: 'Registration Approval',
        subject: 'Welcome to HRM System - Your Registration Has Been Approved!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Approved</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">HRM System</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Human Resource Management</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 40px;">✓</span>
                  </div>
                </div>
                
                <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Registration Approved!</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Congratulations, <strong>{{ownerName}}</strong>! Your company registration for <strong>{{companyName}}</strong> has been approved.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #1f2937; margin-top: 0;">Next Steps:</h3>
                  <ol style="color: #4b5563; line-height: 1.6;">
                    <li>Click the button below to set up your password</li>
                    <li>Complete your organization setup</li>
                    <li>Invite your team members</li>
                    <li>Start managing your HR processes</li>
                  </ol>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="{{loginUrl}}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Set Up Your Account
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  If you have any questions, please contact our support team at support@hrm.com
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2024 HRM System. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        type: 'approval',
        variables: ['ownerName', 'companyName', 'loginUrl'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Registration Rejection',
        subject: 'HRM System Registration Update',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Update</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">HRM System</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Human Resource Management</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background-color: #f59e0b; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 40px;">!</span>
                  </div>
                </div>
                
                <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Registration Update</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Dear <strong>{{ownerName}}</strong>,
                </p>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for your interest in HRM System. After careful review, we are unable to approve your registration for <strong>{{companyName}}</strong> at this time.
                </p>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #92400e; margin-top: 0;">Reason:</h3>
                  <p style="color: #92400e; margin: 0;">{{rejectionReason}}</p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  We encourage you to address the concerns mentioned above and submit a new registration when ready.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="{{appealUrl}}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                    Appeal Decision
                  </a>
                  <a href="{{newRegistrationUrl}}" style="background-color: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    New Registration
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  If you have any questions, please contact our support team at support@hrm.com
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2024 HRM System. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        type: 'rejection',
        variables: ['ownerName', 'companyName', 'rejectionReason', 'appealUrl', 'newRegistrationUrl'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Welcome Email',
        subject: 'Welcome to HRM System - Complete Your Setup',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to HRM System</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">HRM System</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Human Resource Management</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 20px;">
                <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Welcome to HRM System!</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Hi <strong>{{userName}}</strong>,
                </p>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Welcome to <strong>{{companyName}}</strong>'s HRM System! You've been invited to join our team and we're excited to have you on board.
                </p>
                
                <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #0c4a6e; margin-top: 0;">Your Account Details:</h3>
                  <ul style="color: #0c4a6e; line-height: 1.6;">
                    <li><strong>Email:</strong> {{userEmail}}</li>
                    <li><strong>Role:</strong> {{userRole}}</li>
                    <li><strong>Department:</strong> {{department}}</li>
                  </ul>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  To get started, please click the button below to set up your password and complete your profile.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="{{setupUrl}}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Complete Setup
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  If you have any questions, please contact your HR administrator or our support team.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2024 HRM System. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        type: 'welcome',
        variables: ['userName', 'companyName', 'userEmail', 'userRole', 'department', 'setupUrl'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

// Import tap operator
import { tap } from 'rxjs/operators';
