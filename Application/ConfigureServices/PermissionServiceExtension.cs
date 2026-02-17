using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Application.ConfigureServices;

public static class PermissionServiceExtension
{
    public static IServiceCollection AddPermissionPolicies(
        this IServiceCollection services,
        Action<AuthorizationOptions>? configureOptions = null)
    {
        services.AddAuthorization(options =>
        {
            AddMenuPolicies(options, "users", ["view", "create", "edit", "delete"]);
            AddMenuPolicies(options, "roles", ["view", "create", "edit", "delete"]);
            AddMenuPolicies(options, "departments", ["view", "create", "edit", "delete"]);
            AddMenuPolicies(options, "branches", ["view", "create", "edit", "delete"]);
            AddMenuPolicies(options, "menus", ["view", "create", "edit", "delete"]);
            AddMenuPolicies(options, "permissions", ["view", "create", "edit", "delete"]);

            configureOptions?.Invoke(options);
        });

        return services;
    }

    private static void AddMenuPolicies(AuthorizationOptions options, string menuName, string[] actions)
    {
        foreach (var action in actions)
        {
            var policyName = $"{menuName}_{action}";

            options.AddPolicy(policyName, policy =>
                policy.RequireClaim("permission", policyName));
        }
    }
}