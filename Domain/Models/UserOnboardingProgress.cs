using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class UserOnboardingProgress : BaseEntityNonActivable
{
    public int UserId { get; set; }

    public int OnboardingStepId { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser? User { get; set; }

    [ForeignKey(nameof(OnboardingStepId))]
    public virtual OnboardingStep? OnboardingStep { get; set; }
}
