using Application.ConfigureServices.Transformers;
using Domain.Data;
using Domain.Models;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Services.Concretes.AutoMapper;
using Services.Concretes.Identity;
using Shared.Common;
using System.Text;

namespace Application.ConfigureServices;

internal static class ServiceExtension
{
    internal static void ConfigureOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
        });
    }

    internal static void ConfigureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddDbContext<WfDbContext>(option => option
            .UseLazyLoadingProxies()
            .UseSqlServer(configuration.GetConnectionString("DbConnection")));

        services.Configure<MailSettings>(configuration.GetSection("MailSettings"));
        services.Configure<DefaultSettings>(configuration.GetSection("DefaultSettings"));
        services.Configure<EnvironmentVariables>(configuration.GetSection("EnvironmentVariables"));
        services.Configure<TotpSettings>(configuration.GetSection("TotpSettings"));

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseDefaultTypeSerializer()
            .UseSqlServerStorage(configuration.GetConnectionString("DbConnection"), new SqlServerStorageOptions
            {
                DisableGlobalLocks = true
            }));
    }

    internal static void ConfigureIdentityCore(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.SignIn.RequireConfirmedEmail = true;
                options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
            })
            .AddEntityFrameworkStores<WfDbContext>()
            .AddDefaultTokenProviders()
            .AddTokenProvider<NumericTokenProvider<ApplicationUser>>("NumericOtp");
    }

    internal static void ConfigureJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.IncludeErrorDetails = true;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)),
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
    }

    internal static void ConfigureCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins",
                builder =>
                {
                    builder.WithOrigins(
                        "http://localhost:4200",
                        "http://localhost:4400",
                        "https://medipos.techonebd.com",
                        "http://medipos.techonebd.com"

                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });
    }

    internal static void ConfigureAutoMapper(this IServiceCollection services)
    {
        var assembliesToScan = new[]
        {
            typeof(ToDtoMappingProfile).Assembly,
            typeof(ToModelMappingProfile).Assembly
        };

        services.AddAutoMapper(cfg =>
        {
            cfg.AddMaps(assembliesToScan);
            cfg.AddProfile<ToDtoMappingProfile>();
            cfg.AddProfile<ToModelMappingProfile>();
        });
    }
}