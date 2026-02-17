using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IBranchRepository : IBaseRepository<Branch>
{
    Task<IEnumerable<Branch>> GetListAsync(int take, int skip);
    Task<Branch?> GetDetailsAsync(int id);
    Task<IEnumerable<Branch>> GetActiveBranchesAsync();
    Task<IEnumerable<Branch>> GetBranchesByDivisionIdAsync(int divisionId);
    Task<bool> ExistsByCodeAsync(string code, int? excludeId = null);
}
