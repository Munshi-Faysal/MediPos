using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugDoseTemplateViewModel : BaseViewModel
{
    [Display(Name = "Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Description")]
    public string? Description { get; set; }
}
