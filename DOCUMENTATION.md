# Workflow Engine - Technical Documentation

A comprehensive workflow management system built with .NET 10 and Angular, following Onion Architecture principles.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19+-DD0031)](https://angular.io/)
[![Architecture](https://img.shields.io/badge/Architecture-Onion-green)](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Authentication](#authentication)
- [Database](#database)
- [Real-time Features](#real-time-features)
- [Background Jobs](#background-jobs)
- [Deployment](#deployment)
- [Naming Conventions](#naming-conventions)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Workflow Engine** is an enterprise-grade workflow management system that provides:

| Feature | Description |
|---------|-------------|
| **Dynamic Approval Workflows** | Configurable multi-level approval processes with conditions |
| **Document Tracking System (DTS)** | Physical document location tracking with QR codes |
| **Role-Based Access Control** | Granular permissions and user access management |
| **Real-time Notifications** | SignalR-powered instant updates |
| **Email Integration** | Automated email notifications with customizable templates |
| **Delegation Support** | Temporary approval delegation between users |
| **Dynamic Forms** | Configurable form fields per workflow |
| **Reporting** | DevExpress XtraReports integration |
| **Two-Factor Authentication** | TOTP-based 2FA support |

---

## Architecture

The solution follows **Onion Architecture** (Clean Architecture) with clear separation of concerns.

### Layer Diagram

```
+-------------------------------------------------------------+
|                    INFRASTRUCTURE                            |
|  +--------------------------------------------------------+ |
|  |     Workflow.Application         <- Entry Point        | |
|  |   (Program.cs, DI, Middleware)                         | |
|  +------------------------+-------------------------------+ |
|                           |                                  |
|  +------------------------v-------------------------------+ |
|  |   Workflow.Presentation.API      <- Controllers        | |
|  |      (REST API Endpoints)                              | |
|  +------------------------+-------------------------------+ |
|                           |                                  |
|  +------------------------v-------------------------------+ |
|  | Workflow.Repositories.Concretes  <- Data Access        | |
|  |   (EF Core Implementations)                            | |
|  +------------------------+-------------------------------+ |
+---------------------------+----------------------------------+
                            |
+---------------------------v----------------------------------+
|                    APPLICATION LAYER                         |
|  +--------------------------------------------------------+ |
|  |   Workflow.Services.Concretes    <- Business Logic     | |
|  |    (Service Implementations)                           | |
|  +------------------------+-------------------------------+ |
|  +------------------------v-------------------------------+ |
|  |  Services.Contracts | Repos.     <- Interfaces         | |
|  |     (Interfaces)    | Contracts                        | |
|  +--------------------------------------------------------+ |
+---------------------------+----------------------------------+
                            |
+---------------------------v----------------------------------+
|                      DOMAIN CORE                             |
|  +--------------------------------------------------------+ |
|  |       Workflow.Domain            <- Entities           | |
|  |  (Entities, DbContext, Models)                         | |
|  +--------------------------------------------------------+ |
+---------------------------+----------------------------------+
                            |
+---------------------------v----------------------------------+
|                     SHARED KERNEL                            |
|  +--------------------------------------------------------+ |
|  |        Workflow.Shared           <- DTOs, Enums        | |
|  |   (DTOs, Enums, Extensions)                            | |
|  +--------------------------------------------------------+ |
+--------------------------------------------------------------+
```

### Dependency Flow

```
Workflow.Application
    +-- Workflow.Presentation.API
    |       +-- Workflow.Services.Contracts
    |               +-- Workflow.Shared
    +-- Workflow.Services.Concretes
    |       +-- Workflow.Services.Contracts
    |       +-- Workflow.Repositories.Contracts
    |       |       +-- Workflow.Domain
    |       |       +-- Workflow.Shared
    |       +-- Workflow.Domain
    |       +-- Workflow.Shared
    +-- Workflow.Reports
    |       +-- Workflow.Domain
    +-- Workflow.Shared
```

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Dependency Inversion** | Controllers depend on `IService`, not concrete classes |
| **Separation of Concerns** | Each layer has a single responsibility |
| **Domain Independence** | `Workflow.Domain` has zero project dependencies |
| **Testability** | Interfaces enable easy mocking and unit testing |
| **Open/Closed** | New features via new classes, not modifying existing |

---

## Project Structure

### Solution Overview

| Project | Purpose | Layer |
|---------|---------|-------|
| `Workflow.Application` | Application entry point, DI, Middleware | Infrastructure |
| `Workflow.Presentation.API` | API Controllers, Action Filters | Infrastructure |
| `Workflow.Services.Concretes` | Business logic implementations | Application |
| `Workflow.Services.Contracts` | Service interfaces | Application Core |
| `Workflow.Repositories.Concretes` | Data access implementations | Infrastructure |
| `Workflow.Repositories.Contracts` | Repository interfaces | Application Core |
| `Workflow.Domain` | Entities, DbContext, Migrations | Domain Core |
| `Workflow.Shared` | DTOs, Enums, Helpers | Shared Kernel |
| `Workflow.Reports` | DevExpress XtraReports | Infrastructure |

### Detailed Folder Structure

See [FOLDER_SCHEMA.md](FOLDER_SCHEMA.md) for complete folder structure.

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| .NET SDK | 10.0+ |
| Node.js | 20+ |
| SQL Server | 2025+ |
| Visual Studio | 2026+ |

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/Tech-One-Global-Bangladesh/workflow-engine.git
cd workflow-engine

# 2. Restore packages
dotnet restore

# 3. Update connection string in appsettings.Development.json

# 4. Apply migrations
cd Workflow.Application
dotnet ef database update --project ../Workflow.Domain

# 5. Run the API
dotnet run

# 6. Run Angular frontend (separate terminal)
cd Workflow.Presentation.UI
npm install
ng serve
```

### Access Points

| Service | URL |
|---------|-----|
| API | https://localhost:7095 |
| Scalar API Docs | https://localhost:7095/scalar/v1 |
| Angular App | http://localhost:4200 |
| Hangfire Dashboard | https://localhost:7095/hangfire |

---

## Configuration

### appsettings.json Structure

```json
{
  "ConnectionStrings": {
    "DbConnection": "Server=.;Database=WorkflowEngine;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your-256-bit-secret-key-minimum-32-characters",
    "Issuer": "WorkflowEngine",
    "Audience": "WorkflowEngineUsers"
  },
  "MailSettings": {
    "Mail": "noreply@example.com",
    "DisplayName": "Workflow Engine",
    "Password": "email-password",
    "Host": "smtp.example.com",
    "Port": 587
  },
  "TotpSettings": {
    "Issuer": "WorkflowEngine",
    "SecretKey": "totp-secret-key"
  },
  "EnvironmentVariables": {
    "BaseUrl": "https://localhost:7095",
    "FrontendUrl": "http://localhost:4200"
  }
}
```

### CORS Configuration

```csharp
// ServiceExtension.cs
builder.WithOrigins(
    "http://localhost:4200",      // Angular dev
    "http://wfe.tog.ddns-ip.net", // Production
)
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials();
```

---

## API Documentation

### Authentication Header

```http
Authorization: Bearer <jwt-token>
```

### Standard Response Format

```json
{
  "isSuccess": true,
  "message": "Operation successful",
  "data": { }
}
```

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `take` | int | 15 | Records per page |
| `skip` | int | 0 | Records to skip |

### Key Endpoints

#### Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Account/Login` | User login |
| POST | `/api/Account/Register` | User registration |
| POST | `/api/Account/RefreshToken` | Refresh JWT token |
| POST | `/api/Account/Enable2Fa` | Enable 2FA |
| POST | `/api/Account/VerifyOtp` | Verify OTP |
| POST | `/api/Account/ChangePassword` | Change password |
| POST | `/api/Account/ResetPassword` | Reset password |

#### Workflow Engine

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/WorkflowConfig/GetList` | List workflow configs |
| GET | `/api/WorkflowConfig/GetDetails/{id}` | Get config details |
| POST | `/api/WorkflowConfig/Create` | Create workflow |
| PUT | `/api/WorkflowConfig/Update` | Update workflow |
| GET | `/api/ApprovalFlow/GetInit` | Get approval form data |
| POST | `/api/ApprovalFlow/Submit` | Submit for approval |
| POST | `/api/ApprovalFlow/Respond` | Approve/Reject request |

#### Document Tracking (DTS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Warehouse/GetList` | List warehouses |
| POST | `/api/Rack/Create` | Create rack with shelves/boxes |
| POST | `/api/Tracking/Create` | Create file tracking (QR) |
| POST | `/api/Transaction/Create` | Check-in/Check-out file |

---

## Modules

### 1. Workflow Engine (Core)

```
WorkflowEngine/
+-- Activities      -> Define actions (Submit, Approve, Reject)
+-- Status          -> Track states (Draft, Pending, Approved)
+-- RequestTypes    -> Categorize requests
+-- Categories      -> Organize workflows
+-- DynamicFields   -> Custom form fields
+-- Templates       -> Workflow configurations
+-- Conditions      -> Conditional routing
+-- Levels          -> Approval levels
+-- Delegation      -> Approval delegation
```

### 2. Document Tracking System (DTS)

```
DTS/
+-- Warehouses    -> Storage locations
+-- Racks         -> Rack units (auto-generated)
+-- Shelves       -> Shelf divisions (auto-generated)
+-- Boxes         -> Storage boxes (auto-generated)
+-- Tracking      -> QR code generation
+-- Filers        -> Document handlers
+-- Transactions  -> Check-in/Check-out logs
```

### 3. Organization Structure

```
Organization/
+-- Divisions      -> Top-level units
+-- Departments    -> Department management
+-- Branches       -> Branch/location management
+-- Designations   -> Job titles
+-- Roles          -> User roles
+-- UserAccess     -> Permission management
```

---

## Authentication

### JWT Token Flow

```
+----------+      +----------+      +----------+      +----------+
|  Client  |----->|  Login   |----->|  Verify  |----->|  Issue   |
|          |      |  API     |      |  Creds   |      |  Token   |
+----------+      +----------+      +----------+      +----------+
                                          |
                                          v (if 2FA enabled)
                                    +----------+
                                    |  Verify  |
                                    |   OTP    |
                                    +----------+
```

### Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": ["Admin", "Approver"],
  "exp": 1234567890
}
```

### SignalR Authentication

```javascript
// Client-side connection with token
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs?access_token=" + token)
    .build();
```

---

## Database

### Entity Framework Core 10

```csharp
services.AddDbContext<WfDbContext>(option => option
    .UseLazyLoadingProxies()
    .UseSqlServer(connectionString));
```

### Key Entities

| Entity | Description |
|--------|-------------|
| `ApplicationUser` | User accounts (Identity) |
| `WfBaseTemplate` | Workflow templates |
| `WfLevel` | Approval levels |
| `WfCondition` | Routing conditions |
| `WfApprovalMaster` | Approval requests |
| `WfApprovalQueue` | Approval queue |
| `DtsWarehouse` | Storage locations |
| `DtsTracking` | File tracking |

### Migration Commands

```bash
# Add migration
dotnet ef migrations add MigrationName --project Workflow.Domain --startup-project Workflow.Application

# Update database
dotnet ef database update --project Workflow.Domain --startup-project Workflow.Application

# Rollback
dotnet ef database update PreviousMigration --project Workflow.Domain --startup-project Workflow.Application

# Generate SQL script
dotnet ef migrations script --project Workflow.Domain --startup-project Workflow.Application
```

---

## Real-time Features

### SignalR Hub

```csharp
// Hub endpoint
app.MapHub<HubConfig>("/hubs");
```

### Events

| Event | Description |
|-------|-------------|
| `ReceiveNotification` | New notification received |
| `ReceiveMessage` | Chat message received |
| `MessageDelivered` | Message delivery confirmation |
| `MessageSeen` | Message read confirmation |

### Client Integration

```typescript
// Angular service
this.hubConnection.on('ReceiveMessage', (message) => {
    this.messageSubject.next(message);
});
```

---

## Background Jobs

### Hangfire Integration

```csharp
services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseDefaultTypeSerializer()
    .UseSqlServerStorage(connectionString));
```

### Job Types

| Job Type | Use Case |
|----------|----------|
| Fire-and-forget | Send email notifications |
| Delayed | Scheduled reminders |
| Recurring | Daily reports, cleanup |

---

## Deployment

### Production Checklist

- [ ] Update connection strings
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Configure JWT secret key
- [ ] Set up HTTPS certificates
- [ ] Configure CORS for production URLs
- [ ] Enable logging to file/service
- [ ] Set up database backups

### IIS Deployment

```bash
dotnet publish -c Release -o ./publish
```

Configure Application Pool:
- .NET CLR Version: **No Managed Code**
- Identity: **ApplicationPoolIdentity** or custom account

### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Workflow.Application.dll"]
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Entity | `Wf{Name}` / `Dts{Name}` | `WfBaseActivity`, `DtsWarehouse` |
| DTO | `{Name}Dto` | `ActivityDto`, `LoginDto` |
| ViewModel | `{Name}ViewModel` | `ActivityViewModel` |
| InitDTO | `{Name}InitDto` | `RackInitDto` |
| Service Interface | `I{Name}Service` | `IActivityService` |
| Service | `{Name}Service` | `ActivityService` |
| Repository Interface | `I{Name}Repository` | `IActivityRepository` |
| Repository | `{Name}Repository` | `ActivityRepository` |
| Controller | `{Name}Controller` | `ActivityController` |

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `ConfigureCors()` in ServiceExtension.cs |
| 401 Unauthorized | Verify JWT token and expiration |
| Database connection | Check connection string and SQL Server status |
| Migration errors | Ensure correct startup project |
| SignalR not connecting | Check `/hubs` path and CORS |

### Logging

```csharp
// Serilog configuration in Program.cs
builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});
```

### Debug Mode

Set `ASPNETCORE_ENVIRONMENT=Development` for:
- Detailed error messages
- Scalar API UI
- Developer exception page

---

## Support

- **Email**: applicationbd@tech1global.onmicrosoft.com
- **Phone**: +880-1709-654255
- **GitHub**: [Create Issue](https://github.com/Tech-One-Global-Bangladesh/workflow-engine/issues)

---

*Documentation Version: 1.1 | Last Updated: January 2025*

*Built by Tech One Global Bangladesh*
