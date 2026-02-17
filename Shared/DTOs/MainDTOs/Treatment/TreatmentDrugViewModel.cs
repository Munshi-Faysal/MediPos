namespace Shared.DTOs.MainDTOs.Treatment;

public class TreatmentDrugViewModel
{
    public string? EncryptedId { get; set; }
    public string? DrugDetailEncryptedId { get; set; }
    public string? BrandName { get; set; }
    public string? GenericName { get; set; }
    public string? Strength { get; set; }
    public string? Type { get; set; }
    public string? Company { get; set; }
    
    public string? Dose { get; set; }
    public string? Duration { get; set; }
    public string? DurationType { get; set; }
    public string? Instruction { get; set; }
    public string? InstructionText { get; set; }
}
