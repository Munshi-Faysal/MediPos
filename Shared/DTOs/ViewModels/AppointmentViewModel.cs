using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.ViewModels;

public class AppointmentViewModel : BaseViewModel
{
    public int PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public string? PatientImage { get; set; }
    public string PatientPhone { get; set; } = null!;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = null!;
    public DateTime DateTime { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string? Notes { get; set; }
}
