using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels.WorkflowEngine;

public class SidebarMenuViewModel
{
    public int Id { get; set; }

    [Display(Name = "Menu Name")]
    public string? MenuName { get; set; }

    [Display(Name = "Menu Path")]
    public string? MenuPath { get; set; }

    [Display(Name = "Menu Icon")]
    public string? MenuIcon { get; set; }

    [Display(Name = "Parent Menu")]
    public int? ParentMenuId { get; set; }

    [Display(Name = "Parent Menu Name")]
    public string? ParentMenuName { get; set; }
}