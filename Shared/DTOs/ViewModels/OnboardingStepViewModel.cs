using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class OnboardingStepViewModel : BaseViewModel
{
    [Display(Name = "Step Key")]
    public string StepKey { get; set; } = null!;

    [Display(Name = "Title")]
    public string Title { get; set; } = null!;

    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Route")]
    public string? Route { get; set; }

    [Display(Name = "Icon")]
    public string? Icon { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    [Display(Name = "Required")]
    public bool IsRequired { get; set; }

    /// <summary>
    /// Indicates if this step is completed (for user-specific responses)
    /// </summary>
    public bool Completed { get; set; }
}
