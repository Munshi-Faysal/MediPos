namespace Shared.DTOs.MainDTOs.Mail;

public class CompanyRegistrationMailDto : BaseMailDto
{
    public string OrganizationName { get; set; } = null!;
    public string? BillingCycleDate { get; set; }
    public string? RejectionReason { get; set; }
}
