using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.ViewModels;

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
                Generic = d.Generic,
                DrugDetails = d.DrugDetails.Select(dd => new DrugDetail
                {
                    Id = dd.Id,
                    DrugTypeId = dd.DrugTypeId,
                    DrugStrengthId = dd.DrugStrengthId,
                    DrugType = dd.DrugType,
                    DrugStrength = dd.DrugStrength,
                    UnitPrice = dd.UnitPrice,
                    Description = dd.Description,
                    IsActive = dd.IsActive
                }).ToList(),
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

    public async Task<(IEnumerable<DrugMasterViewModel> items, int totalCount)> GetDrugPresentationsAsync(int take, int skip, string? search = null, string? type = null)
    {
        var query = _context.DrugDetails
            .AsNoTracking()
            .Where(dd => dd.IsActive && dd.DrugMaster != null && dd.DrugMaster.IsActive);

        if (!string.IsNullOrWhiteSpace(type) && !type.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(dd => dd.DrugType != null && dd.DrugType.Name == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(dd => 
                dd.DrugMaster!.Name.Contains(s) ||
                dd.DrugMaster.Code.Contains(s) ||
                (dd.DrugMaster.Generic != null && dd.DrugMaster.Generic.Name.Contains(s)) ||
                (dd.DrugMaster.DrugCompany != null && dd.DrugMaster.DrugCompany.Name.Contains(s))
            );
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(dd => dd.DrugMaster!.Name)
            .ThenBy(dd => dd.Id)
            .Skip(skip)
            .Take(take)
            .Select(dd => new DrugMasterViewModel
            {
                Id = dd.DrugMaster!.Id,
                EncryptedId = dd.DrugMaster!.Id.ToString(),
                DrugDetailId = dd.Id,
                Name = dd.DrugMaster!.Name,
                Code = dd.DrugMaster!.Code,
                Description = dd.Description,
                DrugCompanyName = dd.DrugMaster!.DrugCompany != null ? dd.DrugMaster!.DrugCompany.Name : null,
                DrugGenericName = dd.DrugMaster!.Generic != null ? dd.DrugMaster!.Generic.Name : null,
                DrugTypeName = dd.DrugType != null ? dd.DrugType.Name : null,
                DrugStrengthName = dd.DrugStrength != null 
                    ? (dd.DrugStrength.Quantity + (dd.DrugStrength.Unit != null ? " " + dd.DrugStrength.Unit.Name : "")) 
                    : null,
                UnitPrice = dd.UnitPrice,
                IsActive = dd.IsActive && dd.DrugMaster!.IsActive
            })
            .ToListAsync();

        return (items, totalCount);
    }
}