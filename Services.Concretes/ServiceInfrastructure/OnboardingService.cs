using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.MainDTOs.Onboarding;
using Shared.Enums;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class OnboardingService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IAppMailService appMailService,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IOnboardingService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    public async Task<IEnumerable<CompanyRegistrationDto>> GetAllRegistrationsAsync()
    {
        var registrations = await repository.CompanyRegistration.GetAllAsync();
        return mapper.Map<IEnumerable<CompanyRegistrationDto>>(registrations);
    }

    public async Task<IEnumerable<CompanyRegistrationDto>> GetPendingRegistrationsAsync()
    {
        var registrations = await repository.CompanyRegistration.GetAllAsync();
        var pending = registrations.Where(r => r.ApprovalStatus == "Pending");
        return mapper.Map<IEnumerable<CompanyRegistrationDto>>(pending);
    }

    public async Task<CompanyRegistrationDto?> GetRegistrationByIdAsync(int id)
    {
        var registration = await repository.CompanyRegistration.FindByIdAsync(id);
        return mapper.Map<CompanyRegistrationDto>(registration);
    }

    public async Task<bool> ApproveRegistrationAsync(ApprovalDto approvalDto)
    {
        try
        {
            var registration = await repository.CompanyRegistration.FindByIdAsync(approvalDto.Id);
            if (registration == null) return false;

            registration.ApprovalStatus = "Approved";
            registration.BillingCycleDate = approvalDto.BillingCycleDate;
            registration.ApprovedAt = DateTime.Now;
            registration.ApprovedBy = CurrentUser?.Id;
            UpdateAutoFields(registration);

            var result = await repository.CompanyRegistration.UpdateAsync(registration);
            if (result)
            {
                try
                {
                    // Send Approval Email
                    ApplicationUser? user = null;
                    if (registration.UserId.HasValue)
                    {
                        user = await _userManager.FindByIdAsync(registration.UserId.Value.ToString());
                    }

                    var mailDto = new CompanyRegistrationMailDto
                    {
                        ToEmail = registration.Email,
                        Subject = "Registration Approved - MediPos",
                        InitiatorName = user?.DisplayName ?? registration.OrganizationName,
                        OrganizationName = registration.OrganizationName,
                        BillingCycleDate = approvalDto.BillingCycleDate.ToString("dd-MMM-yyyy"),
                        EmailTemplate = nameof(EmailTemplates.CompanyApproved)
                    };
                    await appMailService.SendEmailAsync(mailDto);
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the approval if only email fails
                    Console.WriteLine($"Email sending failed: {ex.Message}");
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ApproveRegistrationAsync: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            return false;
        }
    }

    public async Task<bool> RejectRegistrationAsync(RejectionDto rejectionDto)
    {
        try
        {
            var registration = await repository.CompanyRegistration.FindByIdAsync(rejectionDto.Id);
            if (registration == null)
            {
                Console.WriteLine($"Registration with ID {rejectionDto.Id} not found.");
                return false;
            }

            registration.ApprovalStatus = "Rejected";
            registration.RejectionReason = rejectionDto.Reason;
            UpdateAutoFields(registration);

            var result = await repository.CompanyRegistration.UpdateAsync(registration);
            if (result)
            {
                try
                {
                    // Send Rejection Email
                    ApplicationUser? user = null;
                    if (registration.UserId.HasValue)
                    {
                        user = await _userManager.FindByIdAsync(registration.UserId.Value.ToString());
                    }

                    var mailDto = new CompanyRegistrationMailDto
                    {
                        ToEmail = registration.Email,
                        Subject = "Registration Update - MediPos",
                        InitiatorName = user?.DisplayName ?? registration.OrganizationName,
                        OrganizationName = registration.OrganizationName,
                        RejectionReason = rejectionDto.Reason,
                        EmailTemplate = nameof(EmailTemplates.CompanyRejected)
                    };
                    await appMailService.SendEmailAsync(mailDto);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Email sending failed: {ex.Message}");
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in RejectRegistrationAsync: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            return false;
        }
    }
}
