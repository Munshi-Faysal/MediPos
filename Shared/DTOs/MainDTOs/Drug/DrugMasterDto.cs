using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugMasterDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Drug Name")]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(50)]
    [Display(Name = "Code")]
    public string Code { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Company is required")]
    public int DrugCompanyId { get; set; }
    public int GenericId { get; set; }

    public List<DrugDetailDto> DrugDetails { get; set; } = new();
}