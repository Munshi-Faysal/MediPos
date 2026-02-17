using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IInvestigationRepository : IBaseRepository<Investigation>
{
    Task<IEnumerable<Investigation>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<Investigation?> GetDetailsAsync(int id);
    Task<IEnumerable<Investigation>> GetActiveByDoctorIdAsync(int doctorId);
}
