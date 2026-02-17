using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugMasterRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<DrugMaster>(context), IDrugMasterRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugMaster>> GetListAsync(int take, int skip)
    {
        return await _context.DrugMasters
            .Where(d => d.IsActive)
            .Include(d => d.Generic)            
            .Include(d => d.DrugCompany)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugMaster
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                DrugCompanyId = d.DrugCompanyId,              
                DrugGenericId = d.DrugGenericId,               
                DrugCompany = d.DrugCompany,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugMaster?> GetDetailsAsync(int id)
    {
        return await _context.DrugMasters
            .Where(d => d.Id == id)
            .Include(d => d.Generic)
            .Include(d => d.DrugCompany)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugType)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugStrength)
                    .ThenInclude(ds => ds.Unit)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugMaster>> GetActiveListAsync()
    {
        return await _context.DrugMasters
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DrugMaster
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DrugMaster>> SearchAsync(string term, int take = 50)
    {
        var query = _context.DrugMasters
            .Where(d => d.IsActive);

        if (!string.IsNullOrWhiteSpace(term))
        {
            term = term.ToLower();
            query = query.Where(d => 
                d.Name.ToLower().Contains(term) || 
                (d.Generic != null && d.Generic.Name.ToLower().Contains(term)) ||
                (d.DrugCompany != null && d.DrugCompany.Name.ToLower().Contains(term))
            );
        }

        return await query
            .OrderBy(d => d.Name)
            .Include(d => d.Generic)
            .Include(d => d.DrugCompany)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugType)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugStrength)
                    .ThenInclude(ds => ds.Unit)
            .Take(take)
            .ToListAsync();
    }
}