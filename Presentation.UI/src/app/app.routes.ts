import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { SystemAdminGuard } from './core/guards/system-admin.guard';

export const routes: Routes = [
  // Root - Landing page
  {
    path: '',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
  },

  // Public routes
  {
    path: 'auth/login',
    loadComponent: () => import('./features/public/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/public/callback/callback.component').then(m => m.CallbackComponent)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      // Package Management Route
      {
        path: 'packages',
        loadComponent: () => import('./features/admin/package-management/package-management.component').then(m => m.PackageManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/package-management/package-management.component').then(m => m.PackageManagementComponent)
      },
      // Medicine Management Routes
      {
        path: 'medicines',
        loadComponent: () => import('./features/admin/medicine-management/medicine-management.component').then(m => m.MedicineManagementComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/medicine-management/medicine-list/medicine-list.component').then(m => m.MedicineListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/medicine-management/medicine-form/medicine-form.component').then(m => m.MedicineFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/admin/medicine-management/medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/medicine-management/medicine-form/medicine-form.component').then(m => m.MedicineFormComponent)
          }
        ]
      },
      // Doctor Management Routes
      {
        path: 'doctors',
        loadComponent: () => import('./features/admin/doctor-management/doctor-management.component').then(m => m.DoctorManagementComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/doctor-management/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/doctor-management/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/admin/doctor-management/doctor-detail/doctor-detail.component').then(m => m.DoctorDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/doctor-management/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
          }
        ]
      },
      // Prescription Monitoring Routes
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/admin/prescription-monitoring/prescription-monitoring.component').then(m => m.PrescriptionMonitoringComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/prescription-monitoring/prescription-list/prescription-list.component').then(m => m.PrescriptionListAdminComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/admin/prescription-monitoring/prescription-detail/prescription-detail.component').then(m => m.PrescriptionDetailAdminComponent)
          }
        ]
      },
      // Drugs Management for Admin
      {
        path: 'drugs',
        children: [
          {
            path: 'generic',
            loadComponent: () => import('./features/system-admin/drugs/drug-generic/drug-generic.component').then(m => m.DrugGenericComponent)
          },
          {
            path: 'company',
            loadComponent: () => import('./features/system-admin/drugs/drug-company/drug-company.component').then(m => m.DrugCompanyComponent)
          },
          {
            path: 'strength',
            loadComponent: () => import('./features/system-admin/drugs/drug-strength/drug-strength.component').then(m => (m as any).DrugStrengthComponent)
          },
          {
            path: 'type',
            loadComponent: () => import('./features/system-admin/drugs/drug-type/drug-type.component').then(m => (m as any).DrugTypeComponent)
          },
          {
            path: 'list',
            loadComponent: () => import('./features/system-admin/drugs/drug-list/drug-list.component').then(m => (m as any).DrugListComponent)
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // System Admin routes
  {
    path: 'system-admin',
    canActivate: [SystemAdminGuard],
    loadComponent: () => import('./features/system-admin/system-admin-layout/system-admin-layout.component').then(m => m.SystemAdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/system-admin/system-admin-dashboard/system-admin-dashboard.component').then(m => m.SystemAdminDashboardComponent)
      },
      {
        path: 'onboarding',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/system-admin/onboarding/onboarding.component').then(m => m.OnboardingComponent)
          },

        ]
      },

      {
        path: 'drugs',
        children: [
          {
            path: 'generic',
            loadComponent: () => import('./features/system-admin/drugs/drug-generic/drug-generic.component').then(m => m.DrugGenericComponent)
          },
          {
            path: 'company',
            loadComponent: () => import('./features/system-admin/drugs/drug-company/drug-company.component').then(m => m.DrugCompanyComponent)
          },
          {
            path: 'strength',
            loadComponent: () => import('./features/system-admin/drugs/drug-strength/drug-strength.component').then(m => (m as any).DrugStrengthComponent)
          },
          {
            path: 'type',
            loadComponent: () => import('./features/system-admin/drugs/drug-type/drug-type.component').then(m => (m as any).DrugTypeComponent)
          },
          {
            path: 'duration',
            loadComponent: () => import('./features/system-admin/drugs/drug-duration/drug-duration.component').then(m => (m as any).DrugDurationComponent)
          },
          {
            path: 'list',
            loadComponent: () => import('./features/system-admin/drugs/drug-list/drug-list.component').then(m => (m as any).DrugListComponent)
          }
        ]
      },



      {
        path: 'packages',
        loadComponent: () => import('./features/system-admin/package/packages-module.component').then(m => m.PackagesModuleComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // Doctor routes
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/doctor/doctor-layout/doctor-layout.component').then(m => m.DoctorLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/doctor/appointment/appointment.component').then(m => m.AppointmentComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/doctor/prescription/prescription.component').then(m => m.PrescriptionComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/doctor/prescription/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/doctor/prescription/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/doctor/prescription/prescription-detail/prescription-detail.component').then(m => m.PrescriptionDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/doctor/prescription/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
          }
        ]
      },
      {
        path: 'drugs',
        children: [
          {
            path: 'strength',
            loadComponent: () => import('./features/system-admin/drugs/drug-strength/drug-strength.component').then(m => (m as any).DrugStrengthComponent)
          },
          {
            path: 'type',
            loadComponent: () => import('./features/system-admin/drugs/drug-type/drug-type.component').then(m => (m as any).DrugTypeComponent)
          },
          {
            path: 'generic',
            loadComponent: () => import('./features/system-admin/drugs/drug-generic/drug-generic.component').then(m => m.DrugGenericComponent)
          },
          {
            path: 'company',
            loadComponent: () => import('./features/system-admin/drugs/drug-company/drug-company.component').then(m => m.DrugCompanyComponent)
          },
          {
            path: 'list',
            loadComponent: () => import('./features/system-admin/drugs/drug-list/drug-list.component').then(m => (m as any).DrugListComponent)
          }
        ]
      },
      {
        path: 'templates',
        children: [
          {
            path: 'treatment',
            loadComponent: () => import('./features/doctor/templates/treatment-template/treatment-template.component').then(m => m.TreatmentTemplateComponent)
          },
          {
            path: 'cc',
            loadComponent: () => import('./features/doctor/templates/cc-template/cc-template.component').then(m => m.CcTemplateComponent)
          },
          {
            path: 'oe',
            loadComponent: () => import('./features/doctor/templates/oe-template/oe-template.component').then(m => m.OeTemplateComponent)
          },
          {
            path: 'ix',
            loadComponent: () => import('./features/doctor/templates/ix-template/ix-template.component').then(m => m.IxTemplateComponent)
          },
          {
            path: 'dx',
            loadComponent: () => import('./features/doctor/templates/dx-template/dx-template.component').then(m => m.DxTemplateComponent)
          },
          {
            path: 'advice',
            loadComponent: () => import('./features/system-admin/drugs/drug-advice/drug-advice.component').then(m => (m as any).DrugAdviceComponent)
          },
          {
            path: 'dose',
            loadComponent: () => import('./features/doctor/templates/drug-dose-template/drug-dose-template.component').then(m => m.DrugDoseTemplateComponent)
          },
          {
            path: 'duration',
            loadComponent: () => import('./features/doctor/templates/drug-duration-template/drug-duration-template.component').then(m => m.DrugDurationTemplateComponent)
          },
        ]
      },
      {
        path: 'prescription-setup',
        children: [
          {
            path: 'header',
            loadComponent: () => import('./features/doctor/prescription/setup/prescription-header-setup.component').then(m => m.PrescriptionHeaderSetupComponent)
          },
          {
            path: 'body',
            loadComponent: () => import('./features/doctor/prescription/setup/prescription-body-setup.component').then(m => m.PrescriptionBodySetupComponent)
          },
          {
            path: 'footer',
            loadComponent: () => import('./features/doctor/prescription/setup/prescription-footer-setup.component').then(m => m.PrescriptionFooterSetupComponent)
          }
        ]
      },
      {
        path: 'patients',
        loadComponent: () => import('./features/doctor/patient/patient.component').then(m => m.PatientComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/doctor/profile/doctor-profile.component').then(m => m.DoctorProfileComponent)
      }
    ]
  },

  // Error pages
  {
    path: '401',
    loadComponent: () => import('./shared/components/error-pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '403',
    loadComponent: () => import('./shared/components/error-pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/error-pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  {
    path: '**',
    redirectTo: '/404'
  }
];
