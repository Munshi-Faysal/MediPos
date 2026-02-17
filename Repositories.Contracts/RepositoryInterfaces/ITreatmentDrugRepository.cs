using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface ITreatmentDrugRepository : IBaseRepository<TreatmentDrug>
{
    Task<IEnumerable<TreatmentDrug>> GetDrugsByTemplateIdAsync(int templateId);
}
