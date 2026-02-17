using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugDetailRepository(WfDbContext context)
    : BaseRepository<DrugDetail>(context), IDrugDetailRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugDetail>> GetListAsync(int take, int skip)
    {
        return await _context.DrugDetails
            .Where(d => d.IsActive)
            .Include(d => d.DrugMaster)
            .Include(d => d.DrugStrength)
            .OrderBy(d => d.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<DrugDetail?> GetDetailsAsync(int id)
    {
        return await _context.DrugDetails
            .Where(d => d.Id == id)
            .Include(d => d.DrugMaster)
            .Include(d => d.DrugStrength)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugDetail>> GetByDrugMasterIdAsync(int drugMasterId)
    {
        return await _context.DrugDetails
            .Where(d => d.DrugMasterId == drugMasterId && d.IsActive)
            .Include(d => d.DrugStrength)
            .OrderBy(d => d.Id)
            .ToListAsync();
    }
}