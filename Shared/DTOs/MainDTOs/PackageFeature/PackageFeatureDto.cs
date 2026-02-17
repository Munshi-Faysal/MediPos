using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.PackageFeature;

public class PackageFeatureDto
{
    public string? EncryptedId { get; set; }

    [Required]
    [Display(Name = "Package")]
    public int PackageId { get; set; }
    public string? EncryptedPackageId { get; set; }

    [Required]
    [Display(Name = "Feature")]
    public int FeatureId { get; set; }
    public string? EncryptedFeatureId { get; set; }

    public bool IsActive { get; set; } = true;

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
