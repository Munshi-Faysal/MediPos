using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class TreatmentRepository(WfDbContext context) : BaseRepository<TreatmentTemplate>(context), ITreatmentRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<TreatmentTemplate>> GetTemplatesByDoctorIdAsync(int doctorId)
    {
        return await _dbSet
            .Include(t => t.TreatmentDrugs)
            .Where(t => t.DoctorId == doctorId && t.IsActive)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();
    }

    public async Task<TreatmentTemplate?> GetTemplateWithDrugsAsync(int templateId)
    {
        return await _dbSet
            .Include(t => t.TreatmentDrugs)
                .ThenInclude(td => td.DrugDetail)
                    .ThenInclude(dd => dd.DrugMaster)
            .FirstOrDefaultAsync(t => t.Id == templateId);
    }
}
