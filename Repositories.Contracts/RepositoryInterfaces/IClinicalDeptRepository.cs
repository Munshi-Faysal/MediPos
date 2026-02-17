using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IClinicalDeptRepository : IBaseRepository<ClinicalDept>
{
    Task<IEnumerable<ClinicalDept>> GetListAsync(int take, int skip);
    Task<ClinicalDept?> GetDetailsAsync(int id);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}
