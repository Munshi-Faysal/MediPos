using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Treatment;

public class TreatmentTemplateDto : BaseDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    public int DoctorId { get; set; }
    public string? DoctorEncryptedId { get; set; }

    public List<TreatmentDrugDto> TreatmentDrugs { get; set; } = new();
}
