using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class Doctor : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Password { get; set; }
    public string Phone { get; set; } = null!;
    public string LicenseNumber { get; set; } = null!;
    public DateTime LicenseExpiryDate { get; set; }
    public int ClinicalDeptId { get; set; }
    public int OperationStatusId { get; set; }
    public string? Address { get; set; }
    public DateTime BillingDate { get; set; }
    public string? ProfileImage { get; set; }
    public int? UserId { get; set; }

    public virtual ApplicationUser? User { get; set; }
    public virtual ClinicalDept? ClinicalDept { get; set; }
    public virtual WfBaseKeyword? OperationStatus { get; set; }
}
