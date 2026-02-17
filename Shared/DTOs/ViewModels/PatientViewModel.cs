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
