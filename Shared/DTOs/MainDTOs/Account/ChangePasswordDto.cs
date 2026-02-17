using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "{0} can't be empty.")]
    [Display(Name = "Current Password")]
    public required string CurrentPassword { get; set; }

    [Required(ErrorMessage = "{0} can't be empty.")]
    [Display(Name = "New Password")]
    public required string NewPassword { get; set; }
}