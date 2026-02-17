using Shared.DTOs.MainDTOs.OnboardingStep;

namespace Services.Contracts.ServiceInterfaces;

public interface IOnboardingStepService
{
    Task<OnboardingStatusDto> GetOnboardingStatusAsync();
    Task<List<OnboardingStepDto>> GetAllStepsAsync();
    Task<bool> CompleteStepAsync(string stepKey);
    Task<bool> ResetStepsAsync();
}
