using Application.ConfigureServices;
using Application.Middleware;
using Hangfire;
using Microsoft.AspNetCore.HttpOverrides;
using Presentation.API;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

try
{
    services.ConfigureServices(builder.Configuration);

    services.AddMemoryCache();
    services.ConfigureIdentityCore();
    services.AddHangfireServer();
    services.AddDataProtection();
    services.ConfigureAutoMapper();
    services.RegisterServices();
    services.RegisterRepositories();
    services.RegisterOtherDependencies();
    services.ConfigureCors();
    services.AddControllers().AddApplicationPart(typeof(AssemblyReference).Assembly);
    services.AddEndpointsApiExplorer();
    services.ConfigureJwtAuthentication(builder.Configuration);
    services.AddSignalR();
    services.AddAuthentication();
    services.AddAuthorization();
    services.ConfigureOpenApi();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options
                .WithTitle("Workflow Engine API")
                .WithTheme(ScalarTheme.Purple)
                .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
                .AddPreferredSecuritySchemes("Bearer")
                .AddHttpAuthentication("Bearer", bearer =>
                {
                    bearer.Token = string.Empty;
                })
                .WithFavicon("/favicon.ico")
                .WithCustomCss("""
                    .scalar-api-reference__header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .scalar-auth-button {
                        font-weight: 600 !important;
                        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3) !important;
                    }
                """);
        });
    }

    app.UseSerilogRequestLogging();
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseHttpsRedirection();
    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.UseRouting();
    app.UseCors("AllowSpecificOrigins");
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    });

    app.UseAuthentication();
    app.UseAuthorization();
    app.UseCustomHangfireDashboard(builder.Configuration);
    app.MapControllers();
    //app.MapHub<HubConfig>("/hubs");
    app.MapFallbackToFile("index.html");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed during startup");
    throw;
}
finally
{
    Log.CloseAndFlush();
}