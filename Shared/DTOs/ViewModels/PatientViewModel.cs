using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.ViewModels;

public class PatientViewModel : BaseViewModel
{
    public string Name { get; set; } = null!;
    public int Age { get; set; }
    public string Gender { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string? BloodGroup { get; set; }
    public string? Address { get; set; }
    public string? Image { get; set; }
    public DateTime? LastVisit { get; set; }
}

public class PatientDetailsViewModel : PatientViewModel
{
    public int TotalVisits { get; set; }
    public int PrescriptionCount { get; set; }
    public DateTime? NextAppointment { get; set; }
    public string? LatestWeight { get; set; }
    public List<PatientVisitViewModel> VisitHistory { get; set; } = [];
}

public class PatientVisitViewModel
{
    public DateTime Date { get; set; }
    public string? Diagnosis { get; set; }
    public string? Doctor { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PrescriptionEncryptedId { get; set; }
}
