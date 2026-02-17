using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugDurationTemplateRepository : IBaseRepository<DrugDurationTemplate>
{
    Task<IEnumerable<DrugDurationTemplate>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<DrugDurationTemplate?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugDurationTemplate>> GetActiveByDoctorIdAsync(int doctorId);
}
