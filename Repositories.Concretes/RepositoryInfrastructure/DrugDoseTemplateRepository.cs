using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugDoseTemplateRepository(
    WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<DrugDoseTemplate>(context), IDrugDoseTemplateRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugDoseTemplate>> GetListAsync(int take, int skip, int? doctorId = null)
    {
        var query = _context.DrugDoseTemplates.Where(d => d.IsActive);

        if (doctorId.HasValue)
        {
            query = query.Where(d => d.DoctorId == doctorId || d.DoctorId == null);
        }

        return await query
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugDoseTemplate
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                DoctorId = d.DoctorId,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugDoseTemplate?> GetDetailsAsync(int id)
    {
        return await _context.DrugDoseTemplates
            .Where(d => d.Id == id)
            .Select(d => new DrugDoseTemplate
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

    public async Task<IEnumerable<DrugDoseTemplate>> GetActiveByDoctorIdAsync(int doctorId)
    {
        return await _context.DrugDoseTemplates
            .Where(d => d.IsActive && d.DoctorId == doctorId)
            .OrderBy(d => d.Name)
            .Select(d => new DrugDoseTemplate
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                DoctorId = d.DoctorId,
                IsActive = d.IsActive
            }).ToListAsync();
    }
}
