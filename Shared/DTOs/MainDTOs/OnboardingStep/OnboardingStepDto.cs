using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.OnboardingStep;

public class OnboardingStepDto : BaseDto
{
    [Required]
    [StringLength(50)]
    [Display(Name = "Step Key")]
    public string StepKey { get; set; } = null!;

    [Required]
    [StringLength(100)]
    [Display(Name = "Title")]
    public string Title { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [StringLength(500)]
    [Display(Name = "Route")]
    public string? Route { get; set; }

    [StringLength(1000)]
    [Display(Name = "Icon")]
    public string? Icon { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    [Display(Name = "Required")]
    public bool IsRequired { get; set; } = true;

    /// <summary>
    /// Indicates if this step is completed (for user-specific responses)
    /// </summary>
    public bool Completed { get; set; }
}
