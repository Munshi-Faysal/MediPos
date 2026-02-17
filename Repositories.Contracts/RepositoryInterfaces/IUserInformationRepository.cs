using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IUserInformationRepository : IBaseRepository<ApplicationUser>
{
    int GetSystemUserIdAsync();
    Task<IEnumerable<UserDropdownDto>> GetDropdownItemsAsync();
    ApplicationUser GetCurrentUserAsync();
    Task<string?> GetDisplayNameByEmailAsync(string? recipient);
}