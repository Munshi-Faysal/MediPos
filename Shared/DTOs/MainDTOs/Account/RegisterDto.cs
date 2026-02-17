using Domain.Models;
using Domain.ValidationAttributes;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class RegisterDto
{
    [Unique<ApplicationUser>]
    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100)]
    public required string Username { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(200)]
    [Display(Name = "Full Name")]
    public required string DisplayName { get; set; }

    [Unique<ApplicationUser>]
    [EmailAddress]
    [Required(ErrorMessage = "{0} can't be empty")]
    [Display(Name = "Email Address")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between {2} and {1} characters.")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain :\n Uppercase letter. \n Lowercase letter. \n Number. \n Special character.")]
    public required string Password { get; set; }
}