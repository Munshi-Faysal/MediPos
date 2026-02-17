using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class TreatmentDrugRepository(WfDbContext context) : BaseRepository<TreatmentDrug>(context), ITreatmentDrugRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<TreatmentDrug>> GetDrugsByTemplateIdAsync(int templateId)
    {
        return await _dbSet
            .Include(td => td.DrugDetail)
                .ThenInclude(dd => dd.DrugMaster)
            .Where(td => td.TreatmentTemplateId == templateId && td.IsActive)
            .ToListAsync();
    }
}
