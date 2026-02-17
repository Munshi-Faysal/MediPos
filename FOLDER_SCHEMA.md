# Workflow Engine - Solution Folder Schema

## Solution Root: `D:\Projects\TOG\workflow-engine\`

```
workflow-engine/
|
+-- Workflow.Application/                        # Application Entry Point (ASP.NET Core Web API)
|   +-- ConfigureServices/
|   |   +-- AppExtensions.cs                     # Application extension methods
|   |   +-- DependencyExtension.cs               # DI container registrations
|   |   +-- ServiceExtension.cs                  # Service configurations (DB, Auth, CORS, etc.)
|   |   +-- Transformers/
|   |       +-- BearerSecuritySchemeTransformer.cs # OpenAPI security scheme
|   +-- Hub/
|   |   +-- HubConfig.cs                         # SignalR hub configuration
|   |   +-- UserIdProvider.cs                    # SignalR user ID provider
|   +-- Middleware/
|   |   +-- ExceptionHandlingMiddleware.cs       # Global exception handler
|   +-- Properties/
|   |   +-- launchSettings.json
|   +-- appsettings.json
|   +-- appsettings.Development.json
|   +-- appsettings.Production.json
|   +-- Program.cs                               # Application entry point
|   +-- Workflow.Application.csproj
|
+-- Workflow.Presentation.API/                   # API Controllers Layer
|   +-- ActionFilters/
|   |   +-- ModelStateValidationFilter.cs
|   |   +-- ValidationFilterAttribute.cs
|   +-- Controllers/
|   |   +-- DMS/                                 # Document Management System Controllers
|   |   |   +-- BoxController.cs
|   |   |   +-- FilerController.cs
|   |   |   +-- RackController.cs
|   |   |   +-- TrackingController.cs
|   |   |   +-- TransactionController.cs
|   |   |   +-- WarehouseController.cs
|   |   +-- WorkflowEngine/                      # Core Workflow Controllers
|   |   |   +-- ActivityController.cs
|   |   |   +-- ApprovalConfigController.cs
|   |   |   +-- ApprovalFlowController.cs
|   |   |   +-- BranchController.cs
|   |   |   +-- BranchMappingController.cs
|   |   |   +-- CategoryController.cs
|   |   |   +-- CryptographyController.cs
|   |   |   +-- DelegationController.cs
|   |   |   +-- DepartmentController.cs
|   |   |   +-- DesignationController.cs
|   |   |   +-- DivisionController.cs
|   |   |   +-- DynamicFieldController.cs
|   |   |   +-- DynamicFieldTypeController.cs
|   |   |   +-- DynamicTableController.cs
|   |   |   +-- EmailFormatController.cs
|   |   |   +-- MapModuleController.cs
|   |   |   +-- MenuController.cs
|   |   |   +-- ModuleCategoryController.cs
|   |   |   +-- ModuleController.cs
|   |   |   +-- RequestTypeController.cs
|   |   |   +-- RoleController.cs
|   |   |   +-- StatusController.cs
|   |   |   +-- SubCategoryController.cs
|   |   |   +-- TestController.cs
|   |   |   +-- UserAccessController.cs
|   |   |   +-- UserController.cs
|   |   |   +-- WorkflowConfigController.cs
|   |   +-- AccountController.cs                 # Authentication/Account
|   |   +-- DashboardController.cs               # Dashboard
|   |   +-- HubController.cs                     # SignalR Hub
|   |   +-- ProductController.cs                 # Product Management
|   |   +-- PurchaseRequisitionController.cs     # Purchase Module
|   |   +-- ReportingController.cs               # Reports
|   |   +-- UnitController.cs                    # Units
|   +-- AssemblyReference.cs
|   +-- ReportingServiceExtensions.cs
|   +-- Workflow.Presentation.API.csproj
|
+-- Workflow.Services.Concretes/                 # Business Logic Layer (Implementations)
|   +-- AutoMapper/
|   |   +-- ToDtoMappingProfile.cs               # Entity -> DTO mappings
|   |   +-- ToModelMappingProfile.cs             # DTO -> Entity mappings
|   +-- Base/
|   |   +-- BaseService.cs                       # Base service with common methods
|   |   +-- ServiceManager.cs                    # Service manager/factory
|   +-- Identity/
|   |   +-- NumericTokenProvider.cs              # Custom OTP token provider
|   +-- ServiceInfrastructure/
|   |   +-- DMS/                                 # Document Management Services
|   |   |   +-- BoxService.cs
|   |   |   +-- FilerService.cs
|   |   |   +-- RackService.cs
|   |   |   +-- TrackingService.cs
|   |   |   +-- TransactionService.cs
|   |   |   +-- WarehouseService.cs
|   |   +-- WorkflowEngine/                      # Core Workflow Services
|   |   |   +-- ActivityService.cs
|   |   |   +-- AppMailService.cs
|   |   |   +-- ApprovalConfigService.cs
|   |   |   +-- ApprovalFlowService.cs
|   |   |   +-- BranchMappingService.cs
|   |   |   +-- BranchService.cs
|   |   |   +-- CategoryService.cs
|   |   |   +-- DelegationService.cs
|   |   |   +-- DepartmentService.cs
|   |   |   +-- DesignationService.cs
|   |   |   +-- DivisionService.cs
|   |   |   +-- DynamicFieldService.cs
|   |   |   +-- DynamicFieldTypeService.cs
|   |   |   +-- DynamicTableService.cs
|   |   |   +-- EmailFormatService.cs
|   |   |   +-- MapModuleService.cs
|   |   |   +-- MenuMasterService.cs
|   |   |   +-- ModuleCategoryService.cs
|   |   |   +-- ModuleService.cs
|   |   |   +-- RequestTypeService.cs
|   |   |   +-- RoleService.cs
|   |   |   +-- StatusService.cs
|   |   |   +-- SubCategoryService.cs
|   |   |   +-- Test.cs
|   |   |   +-- UserAccessService.cs
|   |   |   +-- WorkflowConfigService.cs
|   |   +-- AccountService.cs                    # Authentication service
|   |   +-- CommonService.cs                     # Common utilities (QR, etc.)
|   |   +-- DashboardService.cs                  # Dashboard statistics
|   |   +-- HubService.cs                        # SignalR service
|   |   +-- MessageService.cs                    # Messaging service
|   |   +-- NotificationService.cs               # Notifications
|   |   +-- ProductService.cs                    # Products
|   |   +-- PurchaseRequisitionService.cs        # Purchase requisitions
|   |   +-- UnitService.cs                       # Units
|   |   +-- UserService.cs                       # User management
|   +-- Workflow.Services.Concretes.csproj
|
+-- Workflow.Services.Contracts/                 # Service Interfaces Layer
|   +-- Base/
|   |   +-- IBaseAllDetailsService.cs
|   |   +-- IBaseMainService.cs
|   |   +-- IBaseService.cs
|   |   +-- IBaseServiceInit.cs
|   |   +-- IServiceManager.cs
|   +-- ServiceInterfaces/
|   |   +-- WorkflowEngine/                      # Workflow Service Interfaces
|   |   |   +-- IActivityService.cs
|   |   |   +-- IAppMailService.cs
|   |   |   +-- IApprovalConfigService.cs
|   |   |   +-- IApprovalFlowService.cs
|   |   |   +-- IBranchMappingService.cs
|   |   |   +-- IBranchService.cs
|   |   |   +-- ICategoryService.cs
|   |   |   +-- IDelegationService.cs
|   |   |   +-- IDepartmentService.cs
|   |   |   +-- IDesignationService.cs
|   |   |   +-- IDivisionService.cs
|   |   |   +-- IDynamicFieldService.cs
|   |   |   +-- IDynamicFieldTypeService.cs
|   |   |   +-- IDynamicTableService.cs
|   |   |   +-- IEmailFormatService.cs
|   |   |   +-- IMapModuleService.cs
|   |   |   +-- IMenuMasterService.cs
|   |   |   +-- IModuleCategoryService.cs
|   |   |   +-- IModuleService.cs
|   |   |   +-- IRequestTypeService.cs
|   |   |   +-- IRoleService.cs
|   |   |   +-- IStatusService.cs
|   |   |   +-- ISubCategoryService.cs
|   |   |   +-- ITest.cs
|   |   |   +-- IUserAccessService.cs
|   |   |   +-- IWorkflowConfigService.cs
|   |   +-- IAccountService.cs
|   |   +-- IBoxService.cs
|   |   +-- ICommonService.cs
|   |   +-- IDashboardService.cs
|   |   +-- IFilerService.cs
|   |   +-- IHubUserService.cs
|   |   +-- IMessageService.cs
|   |   +-- INotificationService.cs
|   |   +-- IProductService.cs
|   |   +-- IPurchaseRequisitionService.cs
|   |   +-- IRackService.cs
|   |   +-- ITrackingService.cs
|   |   +-- ITransactionService.cs
|   |   +-- IUnitService.cs
|   |   +-- IUserService.cs
|   |   +-- IWarehouseService.cs
|   +-- Workflow.Services.Contracts.csproj
|
+-- Workflow.Repositories.Concretes/             # Data Access Layer (Implementations)
|   +-- Base/
|   |   +-- BaseRepository.cs                    # Generic repository base
|   |   +-- RepositoryManager.cs                 # Repository factory/manager
|   +-- RepositoryInfrastructure/
|   |   +-- DMS/                                 # DMS Repositories
|   |   |   +-- DocumentRepository.cs
|   |   +-- DTS/                                 # Document Tracking Repositories
|   |   |   +-- BoxRepository.cs
|   |   |   +-- FilerRepository.cs
|   |   |   +-- RackRepository.cs
|   |   |   +-- ShelfRepository.cs
|   |   |   +-- TrackingRepository.cs
|   |   |   +-- TransactionRepository.cs
|   |   |   +-- WarehouseRepository.cs
|   |   +-- WorkflowEngine/                      # Workflow Repositories
|   |   |   +-- ... (Repository files)
|   |   +-- ... (Other repositories)
|   +-- Workflow.Repositories.Concretes.csproj
|
+-- Workflow.Repositories.Contracts/             # Repository Interfaces Layer
|   +-- Base/
|   |   +-- IBaseRepository.cs
|   |   +-- IRepositoryManager.cs
|   +-- RepositoryInterfaces/
|   |   +-- DMS/
|   |   +-- DTS/
|   |   +-- WorkflowEngine/
|   +-- Workflow.Repositories.Contracts.csproj
|
+-- Workflow.Domain/                             # Domain/Entities Layer
|   +-- Data/
|   |   +-- DbContextExtensions.cs
|   |   +-- WFDbContext.cs                       # Entity Framework DbContext
|   +-- Migrations/
|   +-- Models/
|   |   +-- BaseModels/
|   |   |   +-- BaseEntity.cs                    # Base entity with audit fields
|   |   |   +-- BaseEntityNonActivable.cs
|   |   +-- ... (Entity classes)
|   +-- ValidationAttributes/
|   +-- ValidationErrors/
|   +-- Workflow.Domain.csproj
|
+-- Workflow.Shared/                             # Shared/Common Layer
|   +-- Common/
|   |   +-- EnumExtensions.cs
|   |   +-- EnvironmentVariables.cs
|   |   +-- ExceptionResponseModel.cs
|   |   +-- GlobalErrors.cs
|   |   +-- GlobalMethods.cs
|   |   +-- PaginatedListConverter.cs
|   |   +-- TotpSettings.cs
|   |   +-- WordConverter.cs
|   +-- Cryptography/
|   |   +-- DataProtectionPurposeStrings.cs
|   |   +-- EncryptionHelper.cs
|   +-- DTOs/
|   |   +-- BaseDTOs/
|   |   +-- InitDTOs/
|   |   +-- MainDTOs/
|   |   +-- ViewModels/
|   +-- Enums/
|   +-- Extensions/
|   +-- Workflow.Shared.csproj
|
+-- Workflow.Reports/                            # Reporting Layer
|   +-- Report/
|   +-- ServiceCollectionExtensions.cs
|   +-- Workflow.Reports.csproj
|
+-- Workflow.Presentation.UI/                    # Angular Frontend
    +-- src/
        +-- app/
```

---

## Architecture Overview (Onion Architecture)

```
+---------------------------------------------------------------------+
|                      Workflow.Application                            |
|                    (Application Entry Point)                         |
|         Program.cs, DI Configuration, Middleware                     |
+----------------------------------+----------------------------------+
                                   |
+----------------------------------v----------------------------------+
|                   Workflow.Presentation.API                          |
|                      (API Controllers)                               |
|              REST Endpoints, Action Filters                          |
+----------------------------------+----------------------------------+
                                   |
+----------------------------------v----------------------------------+
|  Workflow.Services.Contracts  |  Workflow.Services.Concretes        |
|      (Service Interfaces)     |  (Service Implementations)          |
|                               |  Business Logic Layer               |
+----------------------------------+----------------------------------+
                                   |
+----------------------------------v----------------------------------+
| Workflow.Repositories.Contracts | Workflow.Repositories.Concretes   |
|      (Repository Interfaces)    | (Repository Implementations)      |
|                                 | Data Access Layer                 |
+----------------------------------+----------------------------------+
                                   |
+----------------------------------v----------------------------------+
|                       Workflow.Domain                                |
|              Entities, DbContext, Migrations                         |
+----------------------------------+----------------------------------+
                                   |
+----------------------------------v----------------------------------+
|                       Workflow.Shared                                |
|               DTOs, Enums, Common Helpers                            |
|                  (Shared across all layers)                          |
+---------------------------------------------------------------------+
```

---

## Project Dependencies

| Project | Dependencies |
|---------|-------------|
| **Workflow.Application** | Workflow.Presentation.API, Workflow.Services.Concretes, Workflow.Shared, Workflow.Reports |
| **Workflow.Presentation.API** | Workflow.Services.Contracts, Workflow.Reports |
| **Workflow.Services.Concretes** | Workflow.Services.Contracts, Workflow.Repositories.Concretes, Workflow.Domain |
| **Workflow.Services.Contracts** | Workflow.Shared |
| **Workflow.Repositories.Concretes** | Workflow.Repositories.Contracts, Workflow.Domain, Workflow.Shared |
| **Workflow.Repositories.Contracts** | Workflow.Domain, Workflow.Shared |
| **Workflow.Domain** | (Base layer - no project dependencies) |
| **Workflow.Shared** | Workflow.Domain |
| **Workflow.Reports** | Workflow.Domain |

---

## Module Organization

### **WorkflowEngine** - Core workflow management
- Activities, Status, Categories, Branches
- Approval Flow, Delegation, User Access
- Dynamic Fields, Templates, Conditions

### **DMS/DTS** - Document Tracking System
- Warehouse, Rack, Shelf, Box management
- File tracking and transactions
- Filer management

### **Modules** - Business Modules
- Purchase Requisition
- Products & Units

### **Account** - Authentication & Authorization
- Login, Register, Password Reset
- 2FA/TOTP Authentication
- Trusted Devices

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Entity | `Wf{Name}` or `Dts{Name}` | `WfBaseActivity`, `DtsWarehouse` |
| DTO | `{Name}Dto` | `ActivityDto`, `LoginDto` |
| ViewModel | `{Name}ViewModel` | `ActivityViewModel` |
| InitDTO | `{Name}InitDto` | `RackInitDto` |
| Service Interface | `I{Name}Service` | `IActivityService` |
| Repository Interface | `I{Name}Repository` | `IActivityRepository` |
| Controller | `{Name}Controller` | `ActivityController` |

---

*Generated for Workflow Engine Solution - .NET 10*
