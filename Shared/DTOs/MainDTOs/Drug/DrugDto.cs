using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugDto : BaseDto
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Drug Name")]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    [Display(Name = "Generic Name")]
    public string? GenericName { get; set; }

    [StringLength(200)]
    [Display(Name = "Brand Name")]
    public string? BrandName { get; set; }

    [StringLength(1000)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Price")]
    public decimal? Price { get; set; }

    [Display(Name = "Drug Type")]
    public string? DrugTypeEncryptedId { get; set; }
    public string? DrugTypeName { get; set; }

    [Display(Name = "Drug Strength")]
    public string? DrugStrengthEncryptedId { get; set; }
    public string? DrugStrengthName { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public string? DoctorEncryptedId { get; set; }
}
