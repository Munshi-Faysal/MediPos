using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class MenuDetailViewModel
{
    public string? EncryptedMenuDetailId { get; set; }
    public int MenuDetailId { get; set; }
    public int BranchMappingId { get; set; }

    [Display(Name = "Role")]
    public string? RoleName { get; set; }

    [Display(Name = "Branch")]
    public string? BranchName { get; set; }

    [Display(Name = "Division")]
    public string? DivisionName { get; set; }

    [Display(Name = "Department")]
    public string? DepartmentName { get; set; }

    public bool IsAuthorized { get; set; }

    /// <summary>
    /// List of permission configurations for this menu detail
    /// </summary>
    public List<MenuDetailPermissionItem> Permissions { get; set; } = [];
}

/// <summary>
/// Represents a single permission item for a menu detail
/// </summary>
public class MenuDetailPermissionItem
{
    public int ActionId { get; set; }
    public string ActionName { get; set; } = string.Empty;
    public string ActionIcon { get; set; } = string.Empty;
    public string ActionColor { get; set; } = string.Empty;
    public string PermissionKey { get; set; } = string.Empty;
    public bool IsGranted { get; set; }
}