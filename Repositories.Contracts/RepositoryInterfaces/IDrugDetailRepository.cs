using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugDetailRepository : IBaseRepository<DrugDetail>
{
    Task<IEnumerable<DrugDetail>> GetListAsync(int take, int skip);
    Task<DrugDetail?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugDetail>> GetByDrugMasterIdAsync(int drugMasterId);
}