using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IGenericRepository : IBaseRepository<Generic>
{
    Task<IEnumerable<Generic>> GetListAsync(int take, int skip);
    Task<Generic?> GetDetailsAsync(int id);
    Task<IEnumerable<Generic>> GetActiveListAsync();
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}