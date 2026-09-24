using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.ViewModels;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDrugMasterRepository : IBaseRepository<DrugMaster>
{
    Task<IEnumerable<DrugMaster>> GetListAsync(int take, int skip);
    Task<DrugMaster?> GetDetailsAsync(int id);
    Task<IEnumerable<DrugMaster>> GetActiveListAsync();
    Task<IEnumerable<DrugMaster>> SearchAsync(string term, int take = 50);
    Task<(IEnumerable<DrugMasterViewModel> items, int totalCount)> GetDrugPresentationsAsync(int take, int skip, string? search = null, string? type = null);
}
