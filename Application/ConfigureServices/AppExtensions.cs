using Hangfire;
using HangfireBasicAuthenticationFilter;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace Application.ConfigureServices;

public static class AppExtensions
{
    public static IApplicationBuilder UseCustomHangfireDashboard(this IApplicationBuilder app, IConfiguration configuration)
    {
        var hfSettings = configuration.GetSection("HangfireVariables");

        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            DashboardTitle = hfSettings["Title"],
            DisplayStorageConnectionString = bool.Parse(hfSettings["DisplayConnectionString"] ?? "false"),
            Authorization = new[] { new HangfireCustomBasicAuthenticationFilter { User = hfSettings["User"], Pass = hfSettings["Pass"] } },
        });

        //string? timeZone = hfSettings["TimeZone"];
        //RecurringJob.AddOrUpdate<DelegationController>(
        //    "DelegationTaskUpdate",
        //    controller => controller.TaskUpdate(),
        //    Cron.Daily(12, 00),
        //    new RecurringJobOptions
        //    {
        //        TimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone ?? "Asia/Dhaka")
        //    }
        //);
        return app;
    }
}