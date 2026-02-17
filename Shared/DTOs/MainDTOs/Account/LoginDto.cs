using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class LoginDto
{
    [Display(Name = "Email Address/ Username")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public required string UsernameEmail { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    [Display(Name = "Device Id")]
    public Guid DeviceId { get; set; }
}