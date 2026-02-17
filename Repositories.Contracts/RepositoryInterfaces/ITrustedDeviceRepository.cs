using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface ITrustedDeviceRepository : IBaseRepository<TrustedDevice>
{
    Task<bool> IsDeviceTrustedAsync(int userId, Guid deviceId);
}