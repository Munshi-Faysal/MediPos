using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Patient;

public class PatientDto : BaseDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    public int Age { get; set; }

    [StringLength(20)]
    public string Gender { get; set; } = null!;

    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = null!;

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(10)]
    public string? BloodGroup { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(500)]
    public string? Image { get; set; }
}
