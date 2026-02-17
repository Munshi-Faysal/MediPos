using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IOnExaminationRepository : IBaseRepository<OnExamination>
{
    Task<IEnumerable<OnExamination>> GetListAsync(int take, int skip, int? doctorId = null);
    Task<OnExamination?> GetDetailsAsync(int id);
    Task<IEnumerable<OnExamination>> GetActiveByDoctorIdAsync(int doctorId);
}
