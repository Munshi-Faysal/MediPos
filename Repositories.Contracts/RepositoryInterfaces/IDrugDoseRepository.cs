using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugDoseRepository : IBaseRepository<DrugDose>
{
    Task<IEnumerable<DrugDose>> GetListAsync(int take, int skip);
    Task<DrugDose?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugDose>> GetActiveByDoctorIdAsync(int doctorId);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
}
