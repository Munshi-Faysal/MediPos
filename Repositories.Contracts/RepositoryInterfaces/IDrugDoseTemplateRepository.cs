using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugDoseTemplateRepository : IBaseRepository<DrugDoseTemplate>
{
    Task<IEnumerable<DrugDoseTemplate>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<DrugDoseTemplate?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugDoseTemplate>> GetActiveByDoctorIdAsync(int doctorId);
}
