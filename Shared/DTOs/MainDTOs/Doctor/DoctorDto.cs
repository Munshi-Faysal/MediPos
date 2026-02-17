using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Doctor;

public class DoctorDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = null!;

    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    public string Email { get; set; } = null!;

    [Display(Name = "Password")]
    public string? Password { get; set; }

    [Required]
    [Display(Name = "Phone")]
    public string Phone { get; set; } = null!;

    [Required]
    [Display(Name = "License Number")]
    public string LicenseNumber { get; set; } = null!;

    [Display(Name = "License Expiry Date")]
    public DateTime LicenseExpiryDate { get; set; }

    [Display(Name = "Billing Date")]
    public DateTime BillingDate { get; set; }

    [Display(Name = "Address")]
    public string? Address { get; set; }

    [Display(Name = "Profile Image")]
    public string? ProfileImage { get; set; }

    [Required]
    [Display(Name = "Clinical Department")]
    public int ClinicalDeptId { get; set; }

    [Required]
    [Display(Name = "Operation Status")]
    public int OperationStatusId { get; set; }
}
