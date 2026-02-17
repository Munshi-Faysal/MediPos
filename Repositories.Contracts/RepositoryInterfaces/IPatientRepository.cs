using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IPatientRepository : IBaseRepository<Patient>
{
    Task<Patient?> GetPatientByPhoneAsync(string phone);
    Task<IEnumerable<Patient>> SearchPatientsAsync(string term, int take = 50);
}
