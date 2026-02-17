using Shared.DTOs.MainDTOs.Onboarding;

namespace Services.Contracts.ServiceInterfaces;

public interface IOnboardingService
{
    Task<IEnumerable<CompanyRegistrationDto>> GetAllRegistrationsAsync();
    Task<IEnumerable<CompanyRegistrationDto>> GetPendingRegistrationsAsync();
    Task<CompanyRegistrationDto?> GetRegistrationByIdAsync(int id);
    Task<bool> ApproveRegistrationAsync(ApprovalDto approvalDto);
    Task<bool> RejectRegistrationAsync(RejectionDto rejectionDto);
}
