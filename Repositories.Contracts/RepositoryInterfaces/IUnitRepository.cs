using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IUnitRepository : IBaseRepository<Unit>
{
    Task<IEnumerable<Unit>> GetListAsync(int take, int skip);
    Task<Unit?> GetDetailsAsync(int id);
    Task<IEnumerable<Unit>> GetActiveListAsync();
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}