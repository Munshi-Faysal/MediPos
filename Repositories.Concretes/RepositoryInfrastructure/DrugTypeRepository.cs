using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugTypeRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugType>(context), IDrugTypeRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugType>> GetListAsync(int take, int skip)
    {
        return await _context.DrugTypes
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugType
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                CommonUsage = d.CommonUsage,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugType?> GetDetailsAsync(int id)
    {
        return await _context.DrugTypes
            .Where(d => d.Id == id)
            .Select(d => new DrugType
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                CommonUsage = d.CommonUsage,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugType>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugTypes
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DrugType
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                CommonUsage = d.CommonUsage,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.DrugTypes
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = d.Name
            }).ToListAsync();
    }
}
