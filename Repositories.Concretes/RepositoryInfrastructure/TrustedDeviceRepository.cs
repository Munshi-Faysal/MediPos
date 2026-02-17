using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class TrustedDeviceRepository(WfDbContext context) : BaseRepository<TrustedDevice>(context), ITrustedDeviceRepository
{
    private readonly WfDbContext _context = context;

    public async Task<bool> IsDeviceTrustedAsync(int userId, Guid deviceId)
    {
        return await _context.TrustedDevices
            .AnyAsync(d => d.UserId == userId
                           && d.DeviceId == deviceId
                           && !d.IsRevoked);
    }
}