using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Branch;

public class CreateBranchDto
{
    [Required]
    [StringLength(100)]
    [Display(Name = "Branch Name")]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [StringLength(20)]
    [Display(Name = "Branch Code")]
    public string? Code { get; set; }

    [StringLength(500)]
    [Display(Name = "Address")]
    public string? Address { get; set; }

    [Display(Name = "Division")]
    public int? DivisionId { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    [Display(Name = "Active")]
    public bool IsActive { get; set; } = true;
}
