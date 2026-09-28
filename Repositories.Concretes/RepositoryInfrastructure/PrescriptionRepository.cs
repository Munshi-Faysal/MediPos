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
            .Include(p => p.Patient)
            .OrderByDescending(p => p.PrescriptionDate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId)
    {
        return await _dbSet
            .Where(p => p.PatientId == patientId && p.IsActive)
            .Include(p => p.Doctor)
            .Include(p => p.Medicines)
            .OrderByDescending(p => p.PrescriptionDate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Dictionary<int, DateTime>> GetLastPrescriptionDatesByPatientIdsAsync(IEnumerable<int> patientIds)
    {
        var ids = patientIds.Distinct().ToList();
        if (ids.Count == 0) return [];

        return await _dbSet
            .Where(prescription => ids.Contains(prescription.PatientId) && prescription.IsActive)
            .GroupBy(prescription => prescription.PatientId)
            .Select(group => new
            {
                PatientId = group.Key,
                LastPrescriptionDate = group.Max(prescription => prescription.PrescriptionDate)
            })
            .ToDictionaryAsync(item => item.PatientId, item => item.LastPrescriptionDate);
    }

    public async Task<Dictionary<int, int>> GetPrescriptionIdsByAppointmentIdsAsync(IEnumerable<int> appointmentIds)
    {
        var ids = appointmentIds.Distinct().ToList();
        if (ids.Count == 0) return [];

        return await _dbSet
            .Where(prescription => prescription.AppointmentId.HasValue &&
                ids.Contains(prescription.AppointmentId.Value) &&
                prescription.IsActive)
            .GroupBy(prescription => prescription.AppointmentId!.Value)
            .Select(group => new
            {
                AppointmentId = group.Key,
                PrescriptionId = group.Max(prescription => prescription.Id)
            })
            .ToDictionaryAsync(item => item.AppointmentId, item => item.PrescriptionId);
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

    public async Task<Prescription?> GetPrescriptionForUpdateAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Medicines)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Prescription?> GetPrescriptionByScanTokenAsync(string scanToken)
    {
        return await _dbSet
            .Where(p => p.ScanToken == scanToken && p.IsActive)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugMaster)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugType)
            .Include(p => p.Medicines)
                .ThenInclude(m => m.DrugDetail)
                    .ThenInclude(d => d!.DrugStrength)
            .Include(p => p.Doctor)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    public async Task<bool> BarcodePrefixExistsAsync(string prefix)
    {
        return await _dbSet.AnyAsync(p => p.ScanToken.StartsWith(prefix));
    }

    public async Task<Prescription?> GetPrescriptionByBarcodePrefixAsync(string prefix)
    {
        // A shortened barcode must never return the wrong prescription if a prefix collides.
        var tokens = await _dbSet
            .Where(p => p.ScanToken.StartsWith(prefix) && p.IsActive)
            .Select(p => p.ScanToken)
            .Take(2)
            .ToListAsync();

        return tokens.Count == 1 ? await GetPrescriptionByScanTokenAsync(tokens[0]) : null;
    }
}
