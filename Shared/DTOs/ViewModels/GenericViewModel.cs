using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class GenericViewModel : BaseViewModel
{
    [Display(Name = "Generic Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Indication")]
    public string? Indication { get; set; }

    [Display(Name = "Side Effects")]
    public string? SideEffects { get; set; }
}