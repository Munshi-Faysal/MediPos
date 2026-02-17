using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugMasterRepository : IBaseRepository<DrugMaster>
{
    Task<IEnumerable<DrugMaster>> GetListAsync(int take, int skip);
    Task<DrugMaster?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugMaster>> GetActiveListAsync();
    Task<IEnumerable<DrugMaster>> SearchAsync(string term, int take = 50);
}
