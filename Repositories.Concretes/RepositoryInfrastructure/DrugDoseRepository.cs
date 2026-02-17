using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugDoseRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugDose>(context), IDrugDoseRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugDose>> GetListAsync(int take, int skip)
    {
        return await _context.DrugDoses
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugDose
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DoctorId = d.DoctorId,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugDose?> GetDetailsAsync(int id)
    {
        return await _context.DrugDoses
            .Where(d => d.Id == id)
            .Select(d => new DrugDose
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DoctorId = d.DoctorId,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugDose>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugDoses
            .Where(d => d.IsActive && d.DoctorId == doctorId)
            .OrderBy(d => d.Name)
            .Select(d => new DrugDose
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DoctorId = d.DoctorId,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.DrugDoses
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DropdownDto
            {
                Id = d.Id.ToString(),
                Value = d.Name
            }).ToListAsync();
    }
}
