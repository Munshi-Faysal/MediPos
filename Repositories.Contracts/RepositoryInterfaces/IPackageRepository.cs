using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IPackageRepository : IBaseRepository<Package>
{
    Task<IEnumerable<Package>> GetListAsync(int take, int skip);
    Task<Package?> GetDetailsAsync(int id);
    Task<IEnumerable<Package>> GetActivePackagesAsync();
}
