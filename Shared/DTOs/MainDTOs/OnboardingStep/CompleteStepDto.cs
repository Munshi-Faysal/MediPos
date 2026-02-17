using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.OnboardingStep;

public class CompleteStepDto
{
    [Required]
    public string StepKey { get; set; } = null!;
}
