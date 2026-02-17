namespace Shared.DTOs.MainDTOs.Treatment;

public class TreatmentTemplateViewModel
{
    public string? EncryptedId { get; set; }
    public string Name { get; set; } = null!;
    public int DrugCount { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<TreatmentDrugViewModel> TreatmentDrugs { get; set; } = new();
}
