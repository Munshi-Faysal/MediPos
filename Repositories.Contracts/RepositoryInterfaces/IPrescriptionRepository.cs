using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IPrescriptionRepository : IBaseRepository<Prescription>
{
    Task<IEnumerable<Prescription>> GetPrescriptionsByDoctorIdAsync(int doctorId);
    Task<IEnumerable<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId);
    Task<Dictionary<int, DateTime>> GetLastPrescriptionDatesByPatientIdsAsync(IEnumerable<int> patientIds);
    Task<Dictionary<int, int>> GetPrescriptionIdsByAppointmentIdsAsync(IEnumerable<int> appointmentIds);
    Task<Prescription?> GetPrescriptionDetailsAsync(int id);
    Task<Prescription?> GetPrescriptionForUpdateAsync(int id);
    Task<Prescription?> GetPrescriptionByScanTokenAsync(string scanToken);
    Task<Prescription?> GetPrescriptionByBarcodePrefixAsync(string prefix);
    Task<bool> BarcodePrefixExistsAsync(string prefix);
}
