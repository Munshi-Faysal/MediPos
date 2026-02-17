using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class TrustedDeviceDto
{
    [Display(Name = "Device Id")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public required string DeviceId { get; set; }

    [Required(ErrorMessage = "{0} can't be empty")]
    public required string Browser { get; set; }

    [Display(Name = "Operating System")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public required string OperatingSystem { get; set; }

    [Display(Name = "One Time Password (OTP)")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public int UserId { get; set; }

    [Display(Name = "Ip Address")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public required string IpAddress { get; set; }

    [Display(Name = "Is Revoked")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public bool IsRevoked { get; set; }

    [Display(Name = "Created Date")]
    [Required(ErrorMessage = "{0} can't be empty")]
    public DateTime CreatedDate { get; set; }

    [Display(Name = "Last Used Date")]
    public DateTime? LastUsedDate { get; set; }
}