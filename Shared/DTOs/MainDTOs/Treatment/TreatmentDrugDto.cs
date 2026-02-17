using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Treatment;

public class TreatmentDrugDto : BaseDto
{
    public int TreatmentTemplateId { get; set; }
    public string? TreatmentTemplateEncryptedId { get; set; }

    public int DrugDetailId { get; set; }
    public string? DrugDetailEncryptedId { get; set; }

    [MaxLength(100)]
    public string? Dose { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    [MaxLength(50)]
    public string? DurationType { get; set; }

    [MaxLength(50)]
    public string? Instruction { get; set; }

    [MaxLength(200)]
    public string? InstructionText { get; set; }
}
