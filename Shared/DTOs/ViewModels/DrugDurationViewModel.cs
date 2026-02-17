using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugDurationViewModel : BaseViewModel
{
    [Display(Name = "Duration Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Days")]
    public int? Days { get; set; }

    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
