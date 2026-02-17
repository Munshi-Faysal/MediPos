using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugStrengthDto : BaseDto
{
    [Required]
    [StringLength(100)]
    [Display(Name = "Quantity")]
    public string Quantity { get; set; } = null!;

    public string? UnitEncryptedId { get; set; }

    [Display(Name = "Unit")]
    public string? UnitName { get; set; }
}
