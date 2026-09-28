using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class PatientRepository(WfDbContext context) : BaseRepository<Patient>(context), IPatientRepository
{
    public async Task<Patient?> GetPatientByPhoneAsync(string phone)
    {
        return await context.Patients
            .FirstOrDefaultAsync(p => p.Phone == phone && p.IsActive);
    }

    public async Task<IEnumerable<Patient>> SearchPatientsAsync(string term, int take = 50)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return await context.Patients
                .Where(p => p.IsActive)
                .Include(p => p.Appointments.Where(appointment => appointment.IsActive))
                .OrderByDescending(p => p.CreatedDate)
                .Take(take)
                .AsNoTracking()
                .ToListAsync();
        }

        term = term.ToLower();
        return await context.Patients
            .Where(p => p.IsActive &&
                (p.Name.ToLower().Contains(term) || p.Phone.Contains(term) || (p.Email != null && p.Email.ToLower().Contains(term))))
            .Include(p => p.Appointments.Where(appointment => appointment.IsActive))
            .OrderByDescending(p => p.CreatedDate)
            .Take(take)
            .AsNoTracking()
            .ToListAsync();
    }
}
