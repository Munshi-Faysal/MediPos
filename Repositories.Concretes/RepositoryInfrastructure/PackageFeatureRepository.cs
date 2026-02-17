using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class PackageFeatureRepository(WfDbContext context) 
    : BaseRepository<PackageFeature>(context), IPackageFeatureRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<PackageFeature>> GetListAsync(int take, int skip)
    {
        return await _context.PackageFeatures
            .Include(pf => pf.Package)
            .Include(pf => pf.Feature)
            .OrderBy(pf => pf.Package.Name)
            .ThenBy(pf => pf.Feature.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<PackageFeature?> GetDetailsAsync(int id)
    {
        return await _context.PackageFeatures
            .Include(pf => pf.Package)
            .Include(pf => pf.Feature)
            .FirstOrDefaultAsync(pf => pf.Id == id);
    }

    public async Task<IEnumerable<PackageFeature>> GetByPackageIdAsync(int packageId)
    {
        return await _context.PackageFeatures
            .Include(pf => pf.Feature)
            .Where(pf => pf.PackageId == packageId)
            .OrderBy(pf => pf.Feature.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<PackageFeature>> GetByFeatureIdAsync(int featureId)
    {
        return await _context.PackageFeatures
            .Include(pf => pf.Package)
            .Where(pf => pf.FeatureId == featureId)
            .OrderBy(pf => pf.Package.Name)
            .ToListAsync();
    }
}
