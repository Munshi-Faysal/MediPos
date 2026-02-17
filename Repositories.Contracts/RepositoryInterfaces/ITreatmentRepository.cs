using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface ITreatmentRepository : IBaseRepository<TreatmentTemplate>
{
    Task<IEnumerable<TreatmentTemplate>> GetTemplatesByDoctorIdAsync(int doctorId);
    Task<TreatmentTemplate?> GetTemplateWithDrugsAsync(int templateId);
}
