using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugDurationRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugDuration>(context), IDrugDurationRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugDuration>> GetListAsync(int take, int skip)
    {
        return await _context.DrugDurations
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugDuration
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                TotalDay = d.TotalDay,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugDuration?> GetDetailsAsync(int id)
    {
        return await _context.DrugDurations
            .Where(d => d.Id == id)
            .Select(d => new DrugDuration
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                TotalDay = d.TotalDay,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugDuration>> GetActiveListAsync()
    {
        return await _context.DrugDurations
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DrugDuration
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                TotalDay = d.TotalDay,
                Description = d.Description,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.DrugDurations
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = d.Name
            }).ToListAsync();
    }
    public async Task<IEnumerable<DrugDuration>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugDurations
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }
}
