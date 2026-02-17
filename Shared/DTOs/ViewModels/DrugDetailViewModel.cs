using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugDetailViewModel : BaseViewModel
{

    [Display(Name = "Strength")]
    public string? StrengthName { get; set; }
 
    [Display(Name = "Type")]
    public string? DrugTypeName { get; set; }
 
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Unit Price")]
    public decimal UnitPrice { get; set; }
}