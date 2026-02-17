using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugDurationDto : BaseDto
{
    [Required]
    [StringLength(100)]
    [Display(Name = "Duration Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Days")]
    public int? Days { get; set; }

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public string? DoctorEncryptedId { get; set; }
}
