using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class ApplicationUser : IdentityUser<int>
{
    [StringLength(200)]
    public string AccountName { get; set; } = null!;
    [StringLength(200)]
    public string DisplayName { get; set; } = null!;
    [StringLength(200)]
    public string? LineMangerIdAd { get; set; }
    [StringLength(200)]
    public string? EmployeeId { get; set; }

    [Required]
    [Display(Name = "Active")]
    public bool IsActive { get; set; }

    [Display(Name = "Created Date")]
    public DateTime CreatedDate { get; set; }

    [Display(Name = "Modified Date")]
    public DateTime UpdatedDate { get; set; }

    [Display(Name = "Author")]
    public int CreatedBy { get; set; }

    [Display(Name = "Modifier")]
    public int UpdatedBy { get; set; }


    [NotMapped]
    public string? EncryptedId { get; set; }

    [NotMapped]
    public string? Creator { get; set; }

    [NotMapped]
    public string? Modifier { get; set; }

    public virtual ICollection<TrustedDevice> TrustedDevices { get; set; } = new List<TrustedDevice>();
}