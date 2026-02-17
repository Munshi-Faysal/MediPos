using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.MainDTOs.Onboarding;

public class CompanyRegistrationDto : BaseDto
{
    public int Id { get; set; }
    public string OrganizationName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string PackageName { get; set; } = null!;
    public int PackageId { get; set; }
    public decimal PackagePrice { get; set; }
    public string? PackageFeatures { get; set; }
    public string? PaymentStatus { get; set; }
    public string ApprovalStatus { get; set; } = "Pending";
    public string? RejectionReason { get; set; }
    public DateTime? BillingCycleDate { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedBy { get; set; }
    public string? CardNumber { get; set; }
    public string? CardHolder { get; set; }
    public string? ExpiryDate { get; set; }
    public int? UserId { get; set; }
}

public class ApprovalDto
{
    public int Id { get; set; }
    public DateTime BillingCycleDate { get; set; }
}

public class RejectionDto
{
    public int Id { get; set; }
    public string Reason { get; set; } = null!;
}
