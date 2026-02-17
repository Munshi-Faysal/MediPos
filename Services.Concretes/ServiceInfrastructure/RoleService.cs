using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.MainDTOs.Role;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class RoleService(
    RoleManager<ApplicationRole> roleManager,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IRoleService
{
    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
    {
        var roles = await repository.Role.GetAllWithScopeAsync();
        return mapper.Map<IEnumerable<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetRoleByIdAsync(int id)
    {
        var role = await repository.Role.FindByIdAsync(id);
        return role != null ? mapper.Map<RoleDto>(role) : null;
    }

    public async Task<bool> CreateRoleAsync(RoleCreateDto roleCreateDto)
    {
        var role = mapper.Map<ApplicationRole>(roleCreateDto);
        role.NormalizedName = role.Name?.ToUpper();
        role.CreatedDate = DateTime.Now;
        role.UpdatedDate = DateTime.Now;
        role.CreatedBy = CurrentUser?.Id ?? 0;
        role.UpdatedBy = CurrentUser?.Id ?? 0;

        var result = await roleManager.CreateAsync(role);
        return result.Succeeded;
    }

    public async Task<bool> UpdateRoleAsync(RoleUpdateDto roleUpdateDto)
    {
        var role = await roleManager.FindByIdAsync(roleUpdateDto.Id.ToString());
        if (role == null) return false;

        mapper.Map(roleUpdateDto, role);
        role.NormalizedName = role.Name?.ToUpper();
        role.UpdatedDate = DateTime.Now;
        role.UpdatedBy = CurrentUser?.Id ?? 0;

        var result = await roleManager.UpdateAsync(role);
        return result.Succeeded;
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var role = await roleManager.FindByIdAsync(id.ToString());
        if (role == null) return false;

        var result = await roleManager.DeleteAsync(role);
        return result.Succeeded;
    }

    public async Task<bool> ChangeActiveAsync(int id)
    {
        var role = await roleManager.FindByIdAsync(id.ToString());
        if (role == null) return false;

        role.IsActive = !role.IsActive;
        role.UpdatedDate = DateTime.Now;
        role.UpdatedBy = CurrentUser?.Id ?? 0;

        var result = await roleManager.UpdateAsync(role);
        return result.Succeeded;
    }
}
