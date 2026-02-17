using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.MainDTOs.Prescription;

public class PrescriptionDto : BaseDto
{
    public string? DoctorEncryptedId { get; set; }
    public string? PatientEncryptedId { get; set; }
    public string? AppointmentEncryptedId { get; set; }
    public DateTime PrescriptionDate { get; set; }

    public string? PatientName { get; set; }
    public string? PatientAge { get; set; }
    public string? PatientGender { get; set; }
    public string? PatientWeight { get; set; }
    public string? PatientPhone { get; set; }
    public string? PatientAddress { get; set; }
    public int? PatientRegNo { get; set; }
    
    public string? Disease { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? OnExamination { get; set; }
    public string? Investigation { get; set; }
    public string? Advice { get; set; }
    public string? DrugHistory { get; set; }
    public string? Diagnosis { get; set; }
    
    public string? Notes { get; set; }
    public string? Status { get; set; }
    public bool IsActive { get; set; }

    public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
}

public class PrescriptionMedicineDto : BaseDto
{
    public string? MedicineEncryptedId { get; set; }
    public string? MedicineName { get; set; }
    public string? DrugTypeName { get; set; }
    public string? StrengthName { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string? Frequency { get; set; }
    public string Duration { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public decimal Quantity { get; set; }
}
