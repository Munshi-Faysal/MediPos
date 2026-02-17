using Domain.Models;
using Shared.DTOs.ViewModels;
using Shared.DTOs.ViewModels.WorkflowEngine;
using System.Security.Claims;

namespace Services.Contracts.ServiceInterfaces;

public interface IUserService
{
    Task<ApplicationUser?> FindUserByUserNameOrEmailAsync(string userNameEmail);
    Task<UserViewModel?> GetUserAsync(ClaimsPrincipal user);
    Task<ApplicationUser?> FindByIdAsync(string id);
    Task<bool> AssignRoleAsync(int userId, string roleName);
    Task<IEnumerable<string>> GetUserRolesAsync(int userId);
    Task<bool> RemoveRoleAsync(int userId, string roleName);
    //Task<ApplicationUser?> GetDataByIdAsync(int id);
}