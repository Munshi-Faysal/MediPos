using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IRoleRepository : IBaseRepository<ApplicationRole>
{
    Task<IEnumerable<ApplicationRole>> GetAllWithScopeAsync();
}
