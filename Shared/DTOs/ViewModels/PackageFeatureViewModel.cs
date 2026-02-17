using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class PackageFeatureViewModel
{
    public string? EncryptedId { get; set; }

    [Display(Name = "Package")]
    public string PackageName { get; set; } = null!;
    public int PackageId { get; set; }
    public string PackageEncryptedId { get; set; } = null!;

    [Display(Name = "Feature")]
    public string FeatureName { get; set; } = null!;
    public int FeatureId { get; set; }
    public string FeatureEncryptedId { get; set; } = null!;

    public bool IsActive { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
