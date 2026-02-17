using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class UserOnboardingProgressRepository(WfDbContext context)
    : BaseRepository<UserOnboardingProgress>(context), IUserOnboardingProgressRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<UserOnboardingProgress>> GetByUserIdAsync(int userId)
    {
        return await _context.UserOnboardingProgress
            .Where(p => p.UserId == userId)
            .Include(p => p.OnboardingStep)
            .ToListAsync();
    }

    public async Task<UserOnboardingProgress?> GetByUserAndStepAsync(int userId, int stepId)
    {
        return await _context.UserOnboardingProgress
            .Where(p => p.UserId == userId && p.OnboardingStepId == stepId)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> IsStepCompletedAsync(int userId, int stepId)
    {
        return await _context.UserOnboardingProgress
            .AnyAsync(p => p.UserId == userId && p.OnboardingStepId == stepId && p.IsCompleted);
    }
}
