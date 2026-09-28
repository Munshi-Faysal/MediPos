using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class AppointmentRepository(WfDbContext context) : BaseRepository<Appointment>(context), IAppointmentRepository
{
    public async Task<IEnumerable<Appointment>> GetAppointmentsByDoctorIdAsync(int doctorId)
    {
        return await context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.DoctorId == doctorId && a.IsActive)
            .OrderBy(a => a.DateTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId)
    {
        return await context.Appointments
            .Include(a => a.Doctor)
            .Where(a => a.PatientId == patientId && a.IsActive)
            .OrderByDescending(a => a.DateTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByDateAsync(int doctorId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

        return await context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.DoctorId == doctorId && a.IsActive && a.DateTime >= startOfDay && a.DateTime <= endOfDay)
            .OrderBy(a => a.DateTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Appointment?> GetAppointmentDetailsAsync(int id)
    {
        return await context.Appointments
            .Include(appointment => appointment.Patient)
            .Include(appointment => appointment.Doctor)
            .AsNoTracking()
            .FirstOrDefaultAsync(appointment => appointment.Id == id && appointment.IsActive);
    }
}
