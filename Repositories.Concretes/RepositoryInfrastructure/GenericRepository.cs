using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class GenericRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<Generic>(context), IGenericRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<Generic>> GetListAsync(int take, int skip)
    {
        return await _context.Generics
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new Generic
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Indication = d.Indication,
                SideEffects = d.SideEffects,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<Generic?> GetDetailsAsync(int id)
    {
        return await _context.Generics
            .Where(d => d.Id == id)
            .Select(d => new Generic
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Indication = d.Indication,
                SideEffects = d.SideEffects,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Generic>> GetActiveListAsync()
    {
        return await _context.Generics
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new Generic
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Indication = d.Indication,
                SideEffects = d.SideEffects,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.Generics
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = d.Name
            }).ToListAsync();
    }
}