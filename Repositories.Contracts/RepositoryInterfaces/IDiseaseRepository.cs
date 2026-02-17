using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDiseaseRepository : IBaseRepository<Disease>
{
    Task<IEnumerable<Disease>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<Disease?> GetDetailsAsync(int id);
    Task<IEnumerable<Disease>> GetActiveByDoctorIdAsync(int doctorId);
}
