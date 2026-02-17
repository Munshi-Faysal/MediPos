using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Disease;

public class DiseaseDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Name")]
    public string Name { get; set; } = null!;

    [StringLength(1000)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    public string? DoctorEncryptedId { get; set; }
}
