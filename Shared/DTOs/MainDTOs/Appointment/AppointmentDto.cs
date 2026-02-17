using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Appointment;

public class AppointmentDto : BaseDto
{
    [Required]
    public int PatientId { get; set; }
    
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
}
