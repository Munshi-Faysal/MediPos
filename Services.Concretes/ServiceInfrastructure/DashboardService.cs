using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.MainDTOs.Dashboard;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DashboardService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository) : BaseService(userManager, httpContextAccessor), IDashboardService
{
    public async Task<SystemAdminDashboardDto> GetSystemAdminDashboardStatsAsync()
    {
        var registrations = await repository.CompanyRegistration.GetAllAsync();
        var regList = registrations.ToList();

        var stats = new SystemAdminDashboardDto
        {
            TotalBanks = regList.Count,
            PendingOnboarding = regList.Count(r => r.ApprovalStatus == "Pending"),
            ApprovedBanks = regList.Count(r => r.ApprovalStatus == "Approved"),
            RejectedBanks = regList.Count(r => r.ApprovalStatus == "Rejected"),
            RecentActivities = regList.OrderByDescending(r => r.UpdatedDate)
                .Take(5)
                .Select(r => new RecentActivityDto
                {
                    Type = r.ApprovalStatus.ToLower(),
                    Message = $"{r.ApprovalStatus}: {r.OrganizationName}",
                    Timestamp = GetRelativeTime(r.UpdatedDate)
                }).ToList()
        };

        return stats;
    }

    private static string GetRelativeTime(DateTime dateTime)
    {
        var span = DateTime.Now - dateTime;
        if (span.TotalDays > 1) return $"{(int)span.TotalDays} days ago";
        if (span.TotalHours > 1) return $"{(int)span.TotalHours} hours ago";
        if (span.TotalMinutes > 1) return $"{(int)span.TotalMinutes} minutes ago";
        return "Just now";
    }
}
