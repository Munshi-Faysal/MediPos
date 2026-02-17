using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Dashboard")]
[ApiController]
public class DashboardController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("SystemAdminStats")]
    public async Task<IActionResult> GetSystemAdminStats()
    {
        var stats = await service.Dashboard.GetSystemAdminDashboardStatsAsync();
        return Ok(stats);
    }

    //[HttpGet]
    //[Route("MonthlyStatistics")]
    //public async Task<IActionResult> GetMonthlyStatistics()
    //{
    //    var monthlyStatList = await service.Dashboard.GetMonthlyStatisticsAsync();
    //    return monthlyStatList.Any() ? Ok(monthlyStatList) : NotFound();
    //}

    //[HttpGet]
    //[Route("StatusDistribution")]
    //public async Task<IActionResult> GetStatusDistribution()
    //{
    //    var statusDistribution = await service.Dashboard.GetStatusDistributionAsync();
    //    return Ok(statusDistribution);
    //}

    //[HttpGet]
    //[Route("RealTimeStatistics")]
    //public async Task<IActionResult> GetRealTimeStatistics()
    //{
    //    var realTimeStats = await service.Dashboard.GetRealTimeStatisticsAsync();
    //    return Ok(realTimeStats);
    //}
}