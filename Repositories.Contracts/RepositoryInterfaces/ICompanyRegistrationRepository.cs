using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface ICompanyRegistrationRepository : IBaseRepository<CompanyRegistration>
{
    Task<CompanyRegistration?> GetByEmailAsync(string email);
    Task<CompanyRegistration?> GetByUserIdAsync(int userId);
}
