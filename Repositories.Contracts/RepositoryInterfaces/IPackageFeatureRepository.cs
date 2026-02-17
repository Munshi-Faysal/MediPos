using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IPackageFeatureRepository : IBaseRepository<PackageFeature>
{
    Task<IEnumerable<PackageFeature>> GetListAsync(int take, int skip);
    Task<PackageFeature?> GetDetailsAsync(int id);
    Task<IEnumerable<PackageFeature>> GetByPackageIdAsync(int packageId);
    Task<IEnumerable<PackageFeature>> GetByFeatureIdAsync(int featureId);
}
