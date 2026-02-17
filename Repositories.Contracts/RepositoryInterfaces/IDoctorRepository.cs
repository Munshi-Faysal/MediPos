using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IDoctorRepository : IBaseRepository<Doctor>
{
    Task<IEnumerable<Doctor>> GetListAsync(int take, int skip);
    Task<Doctor?> GetByEmailAsync(string email);
    Task<Doctor?> GetByLicenseNumberAsync(string licenseNumber);
    Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync();
    Task<Doctor?> GetByUserIdAsync(int userId);
}
