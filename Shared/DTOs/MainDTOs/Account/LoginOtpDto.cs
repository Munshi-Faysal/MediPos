using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class LoginOtpDto
{
    [Display(Name = "User Id")]
    public int UserId { get; set; }

    [Display(Name = "Device Id")]
    public string? DeviceId { get; set; }

    public string? Browser { get; set; }

    [Display(Name = "Operating System")]
    public string? OperatingSystem { get; set; }

    [Display(Name = "One Time Password (OTP)")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public int Otp { get; set; }
}