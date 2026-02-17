# Workflow Engine

<div align="center">

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2025+-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)](LICENSE)

**Enterprise-grade Dynamic Workflow Management System**

[Documentation](DOCUMENTATION.md) | [Folder Structure](FOLDER_SCHEMA.md) | [Report Issues](https://github.com/Tech-One-Global-Bangladesh/workflow-engine/issues)

</div>

---

## Overview

A comprehensive workflow management system built with **.NET 10** and **Angular 19**, following **Onion Architecture** principles. This repository contains the core engine for managing and executing dynamic workflows across enterprise applications.

Built by **Tech One Global (Pvt.) Ltd.**, it supports metadata-driven automation, modular task orchestration, and scalable integration.

---

## Purpose

Enable teams to:

- Define workflows dynamically via Frontend UI
- Configure multi-level approval processes with conditions
- Trigger actions based on events, conditions, or user roles
- Track physical documents with QR code-based DTS
- Integrate with external systems via REST APIs
- Maintain complete audit trails and execution logs

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Dynamic Approval Workflows** | Configurable multi-level approval with conditional routing |
| **Document Tracking System** | Physical document location tracking with QR codes |
| **Role-Based Access Control** | Granular permissions and user access management |
| **Real-time Notifications** | SignalR-powered instant updates and messaging |
| **Email Integration** | Automated notifications with customizable templates |
| **Delegation Support** | Temporary approval delegation between users |
| **Dynamic Forms** | Configurable form fields per workflow |
| **Reporting** | DevExpress XtraReports integration |
| **Two-Factor Authentication** | TOTP-based 2FA support |
| **Real-time Chat** | SignalR-powered messaging system |

---

## Architecture

The solution follows **Onion Architecture** (Clean Architecture):

```
+-------------------------------------------------------------+
|                    INFRASTRUCTURE                            |
|  Workflow.Application -> Workflow.Presentation.API           |
|                      -> Workflow.Repositories.Concretes      |
+-------------------------------------------------------------+
|                    APPLICATION LAYER                         |
|  Workflow.Services.Concretes -> Workflow.Services.Contracts  |
|                              -> Workflow.Repositories.Contracts|
+-------------------------------------------------------------+
|                      DOMAIN CORE                             |
|                    Workflow.Domain                           |
+-------------------------------------------------------------+
|                     SHARED KERNEL                            |
|                    Workflow.Shared                           |
+-------------------------------------------------------------+
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 10.0 | Core Framework |
| ASP.NET Core | 10.0 | Web API |
| Entity Framework Core | 10.0 | ORM |
| SignalR | 10.0 | Real-time Communication |
| Hangfire | 1.8+ | Background Jobs |
| AutoMapper | 16.0 | Object Mapping |
| Serilog | 10.0 | Logging |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 19 | SPA Framework |
| Bootstrap | 5 | UI Framework |
| SCSS | - | Styling |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| SQL Server 2019+ | Primary Database |
| Entity Framework Migrations | Schema Management |

### Security
| Technology | Purpose |
|------------|---------|
| JWT | Token-based Authentication |
| ASP.NET Identity | User Management |
| TOTP | Two-Factor Authentication |
| Data Protection API | Encryption |

---

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server 2025+](https://www.microsoft.com/sql-server)
- [Visual Studio 2026+](https://visualstudio.microsoft.com/)

### Installation

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
| API Docs (Scalar) | https://localhost:7095/scalar/v1 |
| Angular App | http://localhost:4200 |
| Hangfire Dashboard | https://localhost:7095/hangfire |

---

## Project Structure

```
workflow-engine/
├── Workflow.Application/           # Entry Point (ASP.NET Core Web API)
├── Workflow.Presentation.API/      # API Controllers
├── Workflow.Services.Concretes/    # Business Logic Implementations
├── Workflow.Services.Contracts/    # Service Interfaces
├── Workflow.Repositories.Concretes/# Data Access Implementations
├── Workflow.Repositories.Contracts/# Repository Interfaces
├── Workflow.Domain/                # Entities & DbContext
├── Workflow.Shared/                # DTOs, Enums, Helpers
├── Workflow.Reports/               # DevExpress Reports
└── Workflow.Presentation.UI/       # Angular Frontend
```

> See [FOLDER_SCHEMA.md](FOLDER_SCHEMA.md) for detailed folder structure.

---

## Documentation

| Document | Description |
|----------|-------------|
| [DOCUMENTATION.md](DOCUMENTATION.md) | Complete technical documentation |
| [FOLDER_SCHEMA.md](FOLDER_SCHEMA.md) | Detailed folder structure |

---

## Authentication

- **JWT Bearer Tokens** for API authentication
- **ASP.NET Identity** for user management
- **TOTP-based 2FA** support
- **Trusted Device** management
- **SignalR** authentication for real-time features

---

## API Endpoints

### Core Modules

| Module | Base Path | Description |
|--------|-----------|-------------|
| Account | `/api/Account` | Authentication & User Management |
| Workflow | `/api/WorkflowConfig` | Workflow Configuration |
| Approval | `/api/ApprovalFlow` | Approval Processing |
| DTS | `/api/Warehouse`, `/api/Tracking` | Document Tracking |
| Dashboard | `/api/Dashboard` | Statistics & Analytics |

---

## Deployment

### Supported Platforms

- **Azure App Service**
- **On-premises IIS**
- **Docker Containers**

### Docker

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

## Contributors

| Role | Name |
|------|------|
| Lead Architect | Ashnif Hossain Arnob |
| Development Team | Tech One Global BD Application Development Team |
| Client | Internal |

---

## Support

For technical support or deployment assistance:

| Channel | Contact |
|---------|---------|
| Email | applicationbd@tech1global.onmicrosoft.com |
| Phone | +880-1709-654255 |
| Issues | [GitHub Issues](https://github.com/Tech-One-Global-Bangladesh/workflow-engine/issues) |

---

## License

This project is proprietary software owned by **Tech One Global (Pvt.) Ltd.**

---

<div align="center">

**Built by Tech One Global Bangladesh**

*Copyright 2025 Tech One Global (Pvt.) Ltd. All rights reserved.*

</div>

