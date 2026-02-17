using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IUserOnboardingProgressRepository : IBaseRepository<UserOnboardingProgress>
{
    Task<IEnumerable<UserOnboardingProgress>> GetByUserIdAsync(int userId);
    Task<UserOnboardingProgress?> GetByUserAndStepAsync(int userId, int stepId);
    Task<bool> IsStepCompletedAsync(int userId, int stepId);
}
