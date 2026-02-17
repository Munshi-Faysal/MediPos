namespace Shared.DTOs.ViewModels;

public class PrescriptionViewModel
{
    public string? EncryptedId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientPhone { get; set; }
    public DateTime PrescriptionDate { get; set; }
    public string? Status { get; set; }
    public string? Diagnosis { get; set; }
    public int MedicinesCount { get; set; }
}

public class PrescriptionDetailsViewModel : PrescriptionViewModel
{
    public string? DoctorName { get; set; }
    public string? PatientAge { get; set; }
    public string? PatientGender { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? OnExamination { get; set; }
    public string? Investigation { get; set; }
    public string? Advice { get; set; }
    public string? DrugHistory { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    
    public List<PrescriptionMedicineViewModel> Medicines { get; set; } = new();
}

public class PrescriptionMedicineViewModel
{
    public string? MedicineName { get; set; }
    public string? Dosage { get; set; }
    public string? Instructions { get; set; }
    public string? Duration { get; set; }
}
