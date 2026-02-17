using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class RoleViewModel : BaseViewModel
{
    [Display(Name = "Role Name")]
    public string? RoleName { get; set; }

    [Display(Name = "Role Code")]
    public string? RoleCode { get; set; }

    public string? Remarks { get; set; }
}