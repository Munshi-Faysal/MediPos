using Microsoft.AspNetCore.DataProtection;
using Presentation.API.ActionFilters;
using Repositories.Concretes.Base;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Concretes.ServiceInfrastructure;
using Services.Contracts.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;

namespace Application.ConfigureServices;

internal static class DependencyExtension
{
    internal static void RegisterServices(this IServiceCollection services)
    {
        services.AddScoped<IServiceManager, ServiceManager>();
        services.AddScoped<IAppMailService, AppMailService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddTransient<ICommonService, CommonService>();
    }

    internal static void RegisterRepositories(this IServiceCollection services)
    {
        services.AddScoped<IRepositoryManager, RepositoryManager>();
    }

    internal static void RegisterOtherDependencies(this IServiceCollection services)
    {
        services.AddScoped<EncryptionHelper>();
        services.AddSingleton<DataProtectionPurposeStrings>();
        services.AddSingleton(provider =>
        {
            var dataProtectionProvider = provider.GetRequiredService<IDataProtectionProvider>();
            var dataProtectionPurposeStrings = provider.GetRequiredService<DataProtectionPurposeStrings>();
            return new EncryptionHelper(dataProtectionProvider, dataProtectionPurposeStrings);
        });
        services.AddScoped<ValidationFilterAttribute>();
        services.AddScoped<ModelStateValidationFilter>();
        //services.AddSingleton<IUserIdProvider, UserIdProvider>();
    }
}