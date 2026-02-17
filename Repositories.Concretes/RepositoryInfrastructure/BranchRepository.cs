using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class BranchRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<Branch>(context), IBranchRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<Branch>> GetListAsync(int take, int skip)
    {
        return await _context.Branches
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new Branch
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Code = d.Code,
                Address = d.Address,
                DivisionId = d.DivisionId,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<Branch?> GetDetailsAsync(int id)
    {
        return await _context.Branches
            .Where(b => b.Id == id)
            .Select(d => new Branch
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Code = d.Code,
                Address = d.Address,
                DivisionId = d.DivisionId,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Branch>> GetActiveBranchesAsync()
    {
        return await _context.Branches
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(d => new Branch
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Code = d.Code,
                Address = d.Address,
                DivisionId = d.DivisionId,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<Branch>> GetBranchesByDivisionIdAsync(int divisionId)
    {
        return await _context.Branches
            .Where(b => b.IsActive && b.DivisionId == divisionId)
            .OrderBy(b => b.Name)
            .Select(d => new Branch
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Code = d.Code,
                Address = d.Address,
                DivisionId = d.DivisionId,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<bool> ExistsByCodeAsync(string code, int? excludeId = null)
    {
        var query = _context.Branches.Where(b => b.Code == code);
        
        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }
        
        return await query.AnyAsync();
    }
}
