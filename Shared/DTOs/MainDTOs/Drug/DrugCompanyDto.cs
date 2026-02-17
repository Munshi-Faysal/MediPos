using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugCompanyDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Company Name")]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
