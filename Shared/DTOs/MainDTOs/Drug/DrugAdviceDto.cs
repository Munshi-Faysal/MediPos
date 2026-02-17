using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugAdviceDto : BaseDto
{
    [Required]
    [StringLength(500)]
    [Display(Name = "Name")]
    public string Name { get; set; } = null!;

    [StringLength(1000)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public string? DoctorEncryptedId { get; set; }
}
