namespace Shared.DTOs.MainDTOs.OnboardingStep;

public class OnboardingStatusDto
{
    public List<OnboardingStepDto> Steps { get; set; } = [];
    public int CompletedCount { get; set; }
    public int TotalCount { get; set; }
    public bool IsCompleted { get; set; }
    public double ProgressPercentage { get; set; }
}
