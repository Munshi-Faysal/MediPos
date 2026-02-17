using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class UnitRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<Unit>(context), IUnitRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<Unit>> GetListAsync(int take, int skip)
    {
        return await _context.Units
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new Unit
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<Unit?> GetDetailsAsync(int id)
    {
        return await _context.Units
            .Where(d => d.Id == id)
            .Select(d => new Unit
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Unit>> GetActiveListAsync()
    {
        return await _context.Units
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new Unit
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.Units
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = encryptionHelper.Encrypt(d.Id.ToString()),
                Value = d.Name
            }).ToListAsync();
    }
}