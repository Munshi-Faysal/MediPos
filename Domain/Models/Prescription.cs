using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class Prescription : BaseEntity
{
    [Required]
    public int DoctorId { get; set; }
    [ForeignKey(nameof(DoctorId))]
    public virtual Doctor? Doctor { get; set; }

    [Required]
    public int PatientId { get; set; }
    [ForeignKey(nameof(PatientId))]
    public virtual Patient? Patient { get; set; }

    public int? AppointmentId { get; set; }
    [ForeignKey(nameof(AppointmentId))]
    public virtual Appointment? Appointment { get; set; }

    [Required]
    public DateTime PrescriptionDate { get; set; }

    // Header Patient Details (at time of prescription)
    public string? PatientName { get; set; }
    public string? PatientAge { get; set; }
    public string? PatientGender { get; set; }
    public string? PatientWeight { get; set; }
    public string? PatientPhone { get; set; }
    public string? PatientAddress { get; set; }
    public int? PatientRegNo { get; set; }

    // Clinical Sections
    public string? Disease { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? OnExamination { get; set; }
    public string? Investigation { get; set; }
    public string? Advice { get; set; }
    public string? DrugHistory { get; set; }
    public string? Diagnosis { get; set; } // Δ symbol in UI
    
    public string? Notes { get; set; }
    
    public string? Status { get; set; } // Draft, Completed

    public virtual ICollection<PrescriptionMedicine> Medicines { get; set; } = new List<PrescriptionMedicine>();
}
