using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IFeatureRepository : IBaseRepository<Feature>
{
    Task<IEnumerable<Feature>> GetListAsync(int take, int skip);
    Task<Feature?> GetDetailsAsync(int id);
    Task<Feature?> GetByNameAsync(string name);
    Task<IEnumerable<Feature>> GetActiveFeaturesAsync();
}
