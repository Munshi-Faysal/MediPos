import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { getToastrProviders } from './core/config/toastr.config';

// Import services
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NotificationService } from './core/services/notification.service';
import { RealtimeService } from './core/services/realtime.service';
import { TenantService } from './core/services/tenant.service';
import { OnboardingService } from './core/services/onboarding.service';
import { UserService } from './core/services/user.service';
import { ApprovalService } from './core/services/approval.service';
import { DashboardService } from './core/services/dashboard.service';
import { MailService } from './core/services/mail.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        AuthInterceptor,
        ErrorInterceptor
      ])
    ),
    provideAnimations(),
    ...getToastrProviders(),
    
    // Explicitly provide services
    AuthService,
    ThemeService,
    NotificationService,
    RealtimeService,
    TenantService,
    OnboardingService,
    UserService,
    ApprovalService,
    DashboardService,
    MailService
  ]
};
