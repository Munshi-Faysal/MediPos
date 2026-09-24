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
    public string? Title { get; set; }
    public string? Specialization { get; set; }
    public string? Bio { get; set; }
    public DateTime LicenseExpiryDate { get; set; }
    public int ClinicalDeptId { get; set; }
    public int OperationStatusId { get; set; }
    public string? Address { get; set; }
    public DateTime BillingDate { get; set; }
    public string? ProfileImage { get; set; }
    public string? ClinicName { get; set; }
    public string? ChamberAddress { get; set; }
    public string? ChamberContact { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? OffDay { get; set; }
    public int? UserId { get; set; }

    public virtual ApplicationUser? User { get; set; }
    public virtual ClinicalDept? ClinicalDept { get; set; }
    public virtual WfBaseKeyword? OperationStatus { get; set; }
}
