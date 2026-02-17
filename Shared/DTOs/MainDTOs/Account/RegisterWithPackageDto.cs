using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class RegisterWithPackageDto
{
    // User registration fields
    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100)]
    public required string Username { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(200)]
    [Display(Name = "Full Name")]
    public required string DisplayName { get; set; }

    [EmailAddress]
    [Required(ErrorMessage = "{0} can't be empty")]
    [Display(Name = "Email Address")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between {2} and {1} characters.")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain :\n Uppercase letter. \n Lowercase letter. \n Number. \n Special character.")]
    public required string Password { get; set; }

    // Organization details
    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(200)]
    public required string OrganizationName { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    // Package information
    [Required(ErrorMessage = "{0} can't be empty")]
    public required int PackageId { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100)]
    public required string PackageName { get; set; }

    [Required]
    public required decimal PackagePrice { get; set; }

    public string? PackageFeatures { get; set; } // JSON string

    // Payment information (optional)
    [StringLength(19)]
    public string? CardNumber { get; set; }

    [StringLength(200)]
    public string? CardHolder { get; set; }

    [StringLength(5)]
    public string? ExpiryDate { get; set; }

    [StringLength(4)]
    public string? Cvv { get; set; }
}
