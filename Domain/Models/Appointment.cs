using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class Appointment : BaseEntity
{
    [Required]
    public int PatientId { get; set; }
    
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime DateTime { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Scheduled";

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = "New Visit";

    [StringLength(1000)]
    public string? Notes { get; set; }

    public virtual Patient? Patient { get; set; }
    public virtual Doctor? Doctor { get; set; }
}
