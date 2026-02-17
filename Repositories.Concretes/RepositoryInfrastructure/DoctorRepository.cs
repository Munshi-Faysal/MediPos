using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure;

public class DoctorRepository(WfDbContext context) : BaseRepository<Doctor>(context), IDoctorRepository
{
    private readonly WfDbContext _context = context;
    public async Task<IEnumerable<Doctor>> GetListAsync(int take, int skip)
    {
        return await _dbSet
            .OrderByDescending(x => x.CreatedDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Doctor?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Email == email);
    }

    public async Task<Doctor?> GetByLicenseNumberAsync(string licenseNumber)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.LicenseNumber == licenseNumber);
    }

    public async Task<IEnumerable<DropdownDto>> GetDropdownItemsAsync()
    {
        return await _context.Doctors
            .Where(d => d.IsActive)
            .OrderByDescending(d => d.Id)
            .Select(d => new DropdownDto
            {
                Id = d.Id,
                Value = d.Name
            }).ToListAsync();
    }
    
    public async Task<Doctor?> GetByUserIdAsync(int userId)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
    }
}
