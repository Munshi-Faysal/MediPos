using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class OnboardingStep : BaseEntity
{
    [Required]
    [StringLength(50)]
    public string StepKey { get; set; } = null!;

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? Route { get; set; }

    [StringLength(1000)]
    public string? Icon { get; set; }

    

    public bool IsRequired { get; set; } = true;
}
