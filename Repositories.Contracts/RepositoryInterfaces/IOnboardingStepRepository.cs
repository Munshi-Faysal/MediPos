using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces;

public interface IOnboardingStepRepository : IBaseRepository<OnboardingStep>
{
    Task<IEnumerable<OnboardingStep>> GetListAsync(int take, int skip);
    Task<OnboardingStep?> GetDetailsAsync(int id);
    Task<IEnumerable<OnboardingStep>> GetActiveStepsAsync();
    Task<OnboardingStep?> GetByStepKeyAsync(string stepKey);
}
