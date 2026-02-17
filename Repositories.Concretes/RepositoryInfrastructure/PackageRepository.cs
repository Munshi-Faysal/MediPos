using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class PackageRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<Package>(context), IPackageRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<Package>> GetListAsync(int take, int skip)
    {
        return await _context.Packages
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new Package
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Name = d.Name,
                Price = d.Price,
                Duration = d.Duration,
                Description = d.Description,
                IsPopular = d.IsPopular,
                IsActive = d.IsActive,
                Id = d.Id,
                PackageFeatures = d.PackageFeatures
                    .Where(e => e.IsActive)
                    .Select(e => new PackageFeature
                    {
                        Feature = new Feature
                        {
                            Name = e.Feature != null ? e.Feature.Name : "Unknown"
                        }
                    }).ToList()
            }).ToListAsync();
    }

    public async Task<Package?> GetDetailsAsync(int id)
    {
        return await _context.Packages
            .Where(p => p.Id == id && p.IsActive)
            .Select(d => new Package
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Name = d.Name,
                Price = d.Price,
                Duration = d.Duration,
                Description = d.Description,
                IsPopular = d.IsPopular,
                IsActive = d.IsActive,
                PackageFeatures = d.PackageFeatures
                    .Where(e => e.IsActive && e.Feature!.IsActive)
                    .Select(e => new PackageFeature
                    {
                        Feature = new Feature
                        {
                            Name = e.Feature!.Name
                        }
                    }).ToList()
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Package>> GetActivePackagesAsync()
    {
        return await _context.Packages
            .Where(p => p.IsActive)
            .OrderBy(p => p.Price)
            .Select(d => new Package
            {
                Id = d.Id,
                Name = d.Name,
                Price = d.Price,
                Duration = d.Duration,
                Description = d.Description,
                IsPopular = d.IsPopular,
                PackageFeatures = d.PackageFeatures
                    .Where(pf => pf.IsActive && pf.Feature!.IsActive)
                    .Select(pf => new PackageFeature
                    {
                        Feature = new Feature
                        {
                            Name = pf.Feature!.Name
                        }
                    }).ToList()
            }).ToListAsync();
    }
}
