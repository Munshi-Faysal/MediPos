using Domain.Models;
using Domain.ValidationAttributes;
using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs;

public class MenuMasterDto : UniqueDto
{
    [Required]
    [Unique<WfMenuMaster>]
    [StringLength(80)]
    [Display(Name = "Menu Name")]
    public string MenuName { get; set; } = null!;

    [StringLength(50)]
    [Display(Name = "Menu Path")]
    public string? MenuPath { get; set; }

    [StringLength(30)]
    [Display(Name = "Menu Path")]
    public string? MenuIcon { get; set; }

    [Display(Name = "Parent Menu")]
    public int? ParentMenuId { get; set; }

    public IEnumerable<int> BranchMappingIdList { get; set; } = [];
}