using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class CompanyRegistrationRepository(WfDbContext context) 
    : BaseRepository<CompanyRegistration>(context), ICompanyRegistrationRepository
{
    private readonly WfDbContext _context = context;

    public async Task<CompanyRegistration?> GetByEmailAsync(string email)
    {
        return await _context.CompanyRegistrations
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<CompanyRegistration?> GetByUserIdAsync(int userId)
    {
        return await _context.CompanyRegistrations
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }
}
