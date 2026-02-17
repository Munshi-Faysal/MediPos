using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class TreatmentDrug : BaseEntity
{
    public int TreatmentTemplateId { get; set; }
    public virtual TreatmentTemplate? TreatmentTemplate { get; set; }

    public int DrugDetailId { get; set; }
    public virtual DrugDetail? DrugDetail { get; set; }

    [MaxLength(100)]
    public string? Dose { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    [MaxLength(50)]
    public string? DurationType { get; set; } // Days, Months, Years

    [MaxLength(50)]
    public string? Instruction { get; set; } // Before Food, After Food

    [MaxLength(200)]
    public string? InstructionText { get; set; } // Bengali text (e.g., খাবার আগে)
}
