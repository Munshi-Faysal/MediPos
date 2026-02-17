using Domain.Data;
using Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.DTOs.BaseDTOs;
using Shared.Enums;

namespace Repositories.Concretes.RepositoryInfrastructure;

public sealed class UserInformationRepository(
    WfDbContext context,
    UserManager<ApplicationUser> userManager)
    : BaseRepository<ApplicationUser>(context), IUserInformationRepository
{
    public int GetSystemUserIdAsync()
    {
        return userManager.Users
            .Where(d => d.UserName!.Equals(nameof(CommonKeyword.System)))
            .Select(d => d.Id)
            .FirstOrDefault();
    }

    public async Task<IEnumerable<UserDropdownDto>> GetDropdownItemsAsync()
    {
        return await userManager.Users
            .Where(d => d.IsActive)
            .OrderByDescending(d => d.CreatedDate)
            .Select(d => new UserDropdownDto
            {
                Id = d.Id,
                Value = d.DisplayName,
                SearchString = $"{d.DisplayName} {d.AccountName} {d.Email} {d.EmployeeId}",
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public ApplicationUser GetCurrentUserAsync()
    {
        return userManager.Users
            .Select(d => new ApplicationUser
            {
                Id = d.Id,
                DisplayName = d.DisplayName,
                Email = d.Email
            }).FirstOrDefault()!;
    }

    public async Task<string?> GetDisplayNameByEmailAsync(string? email)
    {
        return await userManager.Users
            .Where(d => d.Email!.Equals(email))
            .Select(d => d.DisplayName)
            .FirstOrDefaultAsync();
    }
}