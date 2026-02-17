using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class PackageDto : BaseDto
{
    [Required]
    [StringLength(100)]
    [Display(Name = "Package Name")]
    public string Name { get; set; } = null!;

    [Required]
    [Range(0, double.MaxValue)]
    [Display(Name = "Price")]
    public decimal Price { get; set; }

    [Required]
    [StringLength(50)]
    [Display(Name = "Duration")]
    public string Duration { get; set; } = null!;

    [Required]
    [StringLength(500)]
    [Display(Name = "Description")]
    public string Description { get; set; } = null!;

    [Display(Name = "Popular")]
    public bool IsPopular { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public List<string> FeatureList { get; set; } = [];
}
