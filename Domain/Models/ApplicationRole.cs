using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class ApplicationRole : IdentityRole<int>
{
    [StringLength(50)]
    public string RoleCode { get; set; } = null!;

    public bool IsAllowMultiple { get; set; }

    public bool IsParallel { get; set; }

    public bool IsByPass { get; set; }

    public int MinApprovalCount { get; set; }

    [StringLength(200)]
    public string? Remarks { get; set; }

    public int HierarchyLevel { get; set; }

    public bool IsSendEmail { get; set; }

    public int ScopeId { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }

    public int CreatedBy { get; set; }

    public int UpdatedBy { get; set; }

    [NotMapped]
    public string? EncryptedId { get; set; }

    [NotMapped]
    public string? Creator { get; set; }

    [NotMapped]
    public string? Modifier { get; set; }

    public virtual WfBaseKeyword? Scope { get; set; }
}