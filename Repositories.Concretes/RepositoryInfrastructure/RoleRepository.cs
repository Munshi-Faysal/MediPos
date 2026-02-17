using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class RoleRepository(WfDbContext context) : BaseRepository<ApplicationRole>(context), IRoleRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<ApplicationRole>> GetAllWithScopeAsync()
    {
        return await _context.Roles
            .Include(r => r.Scope)
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();
    }
}
