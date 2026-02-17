using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class GenericDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Generic Name")]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Indication")]
    public string? Indication { get; set; }

    [StringLength(500)]
    [Display(Name = "Side Effects")]
    public string? SideEffects { get; set; }
}