using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugAdviceRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugAdvice>(context), IDrugAdviceRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugAdvice>> GetListAsync(int take, int skip, int? doctorId = null)
    {
        var query = _context.DrugAdvices.Where(d => d.IsActive);

        if (doctorId.HasValue)
        {
            query = query.Where(d => d.DoctorId == doctorId || d.DoctorId == null);
        }

        return await query
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugAdvice
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                DoctorId = d.DoctorId, // Include DoctorId
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugAdvice?> GetDetailsAsync(int id)
    {
        return await _context.DrugAdvices
            .Where(d => d.Id == id)
            .Select(d => new DrugAdvice
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

    public async Task<IEnumerable<DrugAdvice>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugAdvices
            .Where(d => d.IsActive && d.DoctorId == doctorId)
            .OrderBy(d => d.Name)
            .Select(d => new DrugAdvice
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DoctorId = d.DoctorId,
                IsActive = d.IsActive
            }).ToListAsync();
    }
    public async Task<IEnumerable<DrugAdvice>> GetActiveListAsync()
    {
        return await _context.DrugAdvices
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }
}
