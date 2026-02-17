using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class CompanyRegistration : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string OrganizationName { get; set; } = null!;

    [Required]
    [StringLength(200)]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [StringLength(50)]
    public string? Phone { get; set; }

    [Required]
    [StringLength(100)]
    public string PackageName { get; set; } = null!;

    public int PackageId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PackagePrice { get; set; }

    [StringLength(1000)]
    public string? PackageFeatures { get; set; } // JSON string of features

    [StringLength(50)]
    public string? PaymentStatus { get; set; } // Pending, Completed, Skipped

    [StringLength(50)]
    public string ApprovalStatus { get; set; } = "Pending"; // Pending, Approved, Rejected

    public string? RejectionReason { get; set; }

    public DateTime? BillingCycleDate { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? ApprovedBy { get; set; }

    [StringLength(50)]
    public string? CardNumber { get; set; } // Last 4 digits only for security

    [StringLength(200)]
    public string? CardHolder { get; set; }

    [StringLength(10)]
    public string? ExpiryDate { get; set; }

    public int? UserId { get; set; } // Link to ApplicationUser after registration

    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser? User { get; set; }
}
