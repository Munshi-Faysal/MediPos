using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class ClinicalDeptRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<ClinicalDept>(context), IClinicalDeptRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<ClinicalDept>> GetListAsync(int take, int skip)
    {
        return await _context.ClinicalDepts
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new ClinicalDept
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<ClinicalDept?> GetDetailsAsync(int id)
    {
        return await _context.ClinicalDepts
            .Where(d => d.Id == id)
            .Select(d => new ClinicalDept
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.ClinicalDepts
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id,
                Value = d.Name
            }).ToListAsync();
    }
}
