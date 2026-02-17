using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IChiefComplaintRepository : IBaseRepository<ChiefComplaint>
{
    Task<IEnumerable<ChiefComplaint>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<ChiefComplaint?> GetDetailsAsync(int id);
    Task<IEnumerable<ChiefComplaint>> GetActiveByDoctorIdAsync(int doctorId);
}
