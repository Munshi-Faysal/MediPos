using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugStrengthRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugStrength>(context), IDrugStrengthRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugStrength>> GetListAsync(int take, int skip)
    {
        return await _context.DrugStrengths
            .Include(d => d.Unit)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Quantity)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugStrength
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Quantity = d.Quantity,
                UnitId = d.UnitId,
                Unit = d.Unit,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugStrength?> GetDetailsAsync(int id)
    {
        return await _context.DrugStrengths
            .Include(d => d.Unit)
            .Where(d => d.Id == id)
            .Select(d => new DrugStrength
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Quantity = d.Quantity,
                UnitId = d.UnitId,
                Unit = d.Unit,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugStrength>> GetActiveListAsync()
    {
        return await _context.DrugStrengths
            .Include(d => d.Unit)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Quantity)
            .Select(d => new DrugStrength
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Quantity = d.Quantity,
                UnitId = d.UnitId,
                Unit = d.Unit,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.DrugStrengths
            .Include(d => d.Unit)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Quantity)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = $"{d.Quantity} {(d.Unit != null ? d.Unit.Name : "")}"
            }).ToListAsync();
    }
    public async Task<IEnumerable<DrugStrength>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugStrengths
            .Where(d => d.IsActive)
            .OrderBy(d => d.Quantity)
            .ToListAsync();
    }
}
