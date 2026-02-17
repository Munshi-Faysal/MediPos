using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugCompanyRepository : IBaseRepository<DrugCompany>
{
    Task<IEnumerable<DrugCompany>> GetListAsync(int take, int skip);
    Task<DrugCompany?> GetDetailsAsync(int id);
    Task<List<DrugCompany>> GetActiveListAsync();
    Task<IEnumerable<Shared.DTOs.BaseDTOs.DropdownDto>> GetDropdownItemsAsync();
}
