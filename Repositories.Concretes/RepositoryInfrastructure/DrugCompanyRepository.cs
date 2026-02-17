using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugCompanyRepository(WfDbContext context, EncryptionHelper encryptionHelper) : BaseRepository<DrugCompany>(context), IDrugCompanyRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugCompany>> GetListAsync(int take, int skip)
    {
        return await _context.DrugCompanies
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugCompany
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DisplayOrder = d.DisplayOrder,
                IsActive = d.IsActive
            })
            .ToListAsync();
    }

    public async Task<DrugCompany?> GetDetailsAsync(int id)
    {
        return await _context.DrugCompanies
            .Where(x => x.Id == id)
            .Select(d => new DrugCompany
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DisplayOrder = d.DisplayOrder,
                IsActive = d.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<DrugCompany>> GetActiveListAsync()
    {
        return await _context.DrugCompanies
            .Where(d => d.IsActive)
            .OrderBy(d => d.DisplayOrder)
            .ThenBy(d => d.Name)
            .Select(d => new DrugCompany
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DisplayOrder = d.DisplayOrder,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.DrugCompanies
            .Where(d => d.IsActive)
            .OrderBy(d => d.DisplayOrder)
            .ThenBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = d.Name
            }).ToListAsync();
    }
}
