using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class BranchViewModel : BaseViewModel
{
    [Display(Name = "Branch Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Branch Code")]
    public string? Code { get; set; }

    [Display(Name = "Address")]
    public string? Address { get; set; }

    [Display(Name = "Division")]
    public int? DivisionId { get; set; }

    public string? DivisionName { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }
}
