using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class PackageViewModel : BaseViewModel
{
    [Display(Name = "Package Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Price")]
    public decimal Price { get; set; }

    [Display(Name = "Duration")]
    public string Duration { get; set; } = null!;

    [Display(Name = "Description")]
    public string Description { get; set; } = null!;

    [Display(Name = "Popular")]
    public bool IsPopular { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public List<string> FeatureList { get; set; } = [];
}
