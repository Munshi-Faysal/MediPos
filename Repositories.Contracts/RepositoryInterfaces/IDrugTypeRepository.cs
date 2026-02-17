using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugTypeRepository : IBaseRepository<DrugType>
{
    Task<IEnumerable<DrugType>> GetListAsync(int take, int skip);
    Task<DrugType?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugType>> GetActiveByDoctorIdAsync(int doctorId);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}
