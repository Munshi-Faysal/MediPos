using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugStrengthViewModel : BaseViewModel
{
    [Display(Name = "Quantity")]
    public string Quantity { get; set; } = null!;

    [Display(Name = "Unit")]
    public string? UnitName { get; set; }
}
