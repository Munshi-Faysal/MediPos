using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class FeatureRepository(WfDbContext context) 
    : BaseRepository<Feature>(context), IFeatureRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<Feature>> GetListAsync(int take, int skip)
    {
        return await _context.Features
            .Where(f => f.IsActive)
            .OrderBy(f => f.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Feature?> GetDetailsAsync(int id)
    {
        return await _context.Features
            .Include(f => f.PackageFeatures)
                .ThenInclude(pf => pf.Package)
            .FirstOrDefaultAsync(f => f.Id == id && f.IsActive);
    }

    public async Task<Feature?> GetByNameAsync(string name)
    {
        return await _context.Features
            .FirstOrDefaultAsync(f => f.Name == name && f.IsActive);
    }

    public async Task<IEnumerable<Feature>> GetActiveFeaturesAsync()
    {
        return await _context.Features
            .Where(f => f.IsActive)
            .OrderBy(f => f.Name)
            .ToListAsync();
    }
}
