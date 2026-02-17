using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugViewModel : BaseViewModel
{
    [Display(Name = "Drug Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Generic Name")]
    public string? GenericName { get; set; }

    [Display(Name = "Brand Name")]
    public string? BrandName { get; set; }

    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Price")]
    public decimal? Price { get; set; }

    [Display(Name = "Drug Type")]
    public string? DrugTypeName { get; set; }

    [Display(Name = "Drug Strength")]
    public string? DrugStrengthName { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
