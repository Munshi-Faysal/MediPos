using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugStrengthRepository : IBaseRepository<DrugStrength>
{
    Task<IEnumerable<DrugStrength>> GetListAsync(int take, int skip);
    Task<DrugStrength?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugStrength>> GetActiveListAsync();
    Task<IEnumerable<DrugStrength>> GetActiveByDoctorIdAsync(int doctorId);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}
