using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DoctorViewModel : BaseViewModel
{
    [Display(Name = "Doctor Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Email")]
    public string Email { get; set; } = null!;

    [Display(Name = "Phone")]
    public string Phone { get; set; } = null!;

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

    [Display(Name = "Clinical Department")]
    public string? ClinicalDeptName { get; set; }

    [Display(Name = "Operation Status")]
    public string? OperationStatusName { get; set; }
}
