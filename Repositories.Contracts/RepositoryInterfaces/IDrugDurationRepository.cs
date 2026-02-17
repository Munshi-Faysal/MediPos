using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugDurationRepository : IBaseRepository<DrugDuration>
{
    Task<IEnumerable<DrugDuration>> GetListAsync(int take, int skip);
    Task<DrugDuration?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugDuration>> GetActiveListAsync();
    Task<IEnumerable<DrugDuration>> GetActiveByDoctorIdAsync(int doctorId);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}
