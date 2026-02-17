namespace Shared.DTOs.MainDTOs.Dashboard;

public class SystemAdminDashboardDto
{
    public int PendingOnboarding { get; set; }
    public int ApprovedBanks { get; set; }
    public int RejectedBanks { get; set; }
    public int TotalBanks { get; set; }
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class RecentActivityDto
{
    public string Type { get; set; } = null!; // approved, pending, rejected
    public string Message { get; set; } = null!;
    public string Timestamp { get; set; } = null!;
}
