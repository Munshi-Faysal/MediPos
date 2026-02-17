using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugAdviceRepository : IBaseRepository<DrugAdvice>
{
    Task<IEnumerable<DrugAdvice>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<DrugAdvice?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugAdvice>> GetActiveByDoctorIdAsync(int doctorId);
    Task<IEnumerable<DrugAdvice>> GetActiveListAsync();
}
