using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Doctor;

public class DoctorProfileDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(200)]
    public string? Specialization { get; set; }

    [Required]
    [StringLength(50)]
    public string LicenseNumber { get; set; } = null!;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Phone { get; set; } = null!;

    [StringLength(2000)]
    public string? Bio { get; set; }

    [StringLength(200)]
    public string? ClinicName { get; set; }

    [StringLength(500)]
    public string? ChamberAddress { get; set; }

    [StringLength(50)]
    public string? ChamberContact { get; set; }

    [StringLength(20)]
    public string? StartTime { get; set; }

    [StringLength(20)]
    public string? EndTime { get; set; }

    [StringLength(20)]
    public string? OffDay { get; set; }
}
