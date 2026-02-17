using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class ResetPasswordDto
{
    [Display(Name = "Email Address/ Username")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public required string UsernameEmail { get; set; }

    [Display(Name = "One Time Password (OTP)")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public int Otp { get; set; }

    [Display(Name = "New Password")]
    [Required(ErrorMessage = "{0} can't be empty")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between {2} and {1} characters.")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain :\n Uppercase letter. \n Lowercase letter. \n Number. \n Special character.")]
    public required string NewPassword { get; set; }
}