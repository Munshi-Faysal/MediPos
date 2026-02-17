using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IPrescriptionRepository : IBaseRepository<Prescription>
{
    Task<IEnumerable<Prescription>> GetPrescriptionsByDoctorIdAsync(int doctorId);
    Task<Prescription?> GetPrescriptionDetailsAsync(int id);
}
