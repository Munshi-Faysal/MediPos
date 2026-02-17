using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class PrescriptionRepository(WfDbContext context) : BaseRepository<Prescription>(context), IPrescriptionRepository
{
    public async Task<IEnumerable<Prescription>> GetPrescriptionsByDoctorIdAsync(int doctorId)
    {
        return await _dbSet
            .Where(p => p.DoctorId == doctorId)
            .Include(p => p.Medicines)
            .OrderByDescending(p => p.PrescriptionDate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Prescription?> GetPrescriptionDetailsAsync(int id)
    {
        return await _dbSet
            .Where(p => p.Id == id)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugMaster)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugType)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugStrength)
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }
}
