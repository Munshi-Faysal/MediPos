using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.ViewModels;
using System.Security.Claims;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class UserService(UserManager<ApplicationUser> userManager,
    IRepositoryManager repository,
    IHttpContextAccessor httpContextAccessor,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IUserService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly IRepositoryManager _repository = repository;

    public async Task<ApplicationUser?> FindByIdAsync(string id)
    {
        return await _userManager.FindByIdAsync(id);
    }

    public async Task<ApplicationUser?> FindUserByUserNameOrEmailAsync(string userNameEmail)
    {
        return await _userManager.FindByNameAsync(userNameEmail) ?? await _userManager.FindByEmailAsync(userNameEmail);
    }

    public async Task<UserViewModel?> GetUserAsync(ClaimsPrincipal user)
    {
        var applicationUser = await _userManager.GetUserAsync(user);
        if (applicationUser == null) return null;

        var viewModel = mapper.Map<UserViewModel>(applicationUser);
        viewModel.Roles = (await _userManager.GetRolesAsync(applicationUser)).ToList();
        
        var doctor = await _repository.Doctor.GetByUserIdAsync(applicationUser.Id);
        if (doctor != null)
        {
            viewModel.DoctorId = doctor.Id;
        }
        
        return viewModel;
    }

    public async Task<bool> AssignRoleAsync(int userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;

        var result = await _userManager.AddToRoleAsync(user, roleName);
        return result.Succeeded;
    }

    public async Task<IEnumerable<string>> GetUserRolesAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Enumerable.Empty<string>();

        return await _userManager.GetRolesAsync(user);
    }

    public async Task<bool> RemoveRoleAsync(int userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        return result.Succeeded;
    }
}