using Shared.DTOs.MainDTOs.Dashboard;

namespace Services.Contracts.ServiceInterfaces;

public interface IDashboardService
{
    Task<SystemAdminDashboardDto> GetSystemAdminDashboardStatsAsync();
}
