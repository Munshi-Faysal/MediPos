using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Role;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string RoleCode { get; set; } = null!;
    public bool IsAllowMultiple { get; set; }
    public bool IsParallel { get; set; }
    public bool IsByPass { get; set; }
    public int MinApprovalCount { get; set; }
    public string? Remarks { get; set; }
    public int HierarchyLevel { get; set; }
    public bool IsSendEmail { get; set; }
    public int ScopeId { get; set; }
    public string? ScopeName { get; set; }
    public bool IsActive { get; set; }
}

public class RoleCreateDto
{
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string RoleCode { get; set; } = null!;

    public bool IsAllowMultiple { get; set; }
    public bool IsParallel { get; set; }
    public bool IsByPass { get; set; }
    public int MinApprovalCount { get; set; }
    public string? Remarks { get; set; }
    public int HierarchyLevel { get; set; }
    public bool IsSendEmail { get; set; }

    [Required]
    public int ScopeId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class RoleUpdateDto : RoleCreateDto
{
    [Required]
    public int Id { get; set; }
}
