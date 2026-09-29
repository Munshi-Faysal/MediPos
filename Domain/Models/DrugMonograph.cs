namespace Domain.Models;

public partial class DrugMonograph
{
    public int Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? DosageForm { get; set; }
    public string? Strength { get; set; }
    public string? Manufacturer { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? StripPrice { get; set; }
    public string? PackImageUrl { get; set; }
    public string? MedExUrl { get; set; }
    public string? Indications { get; set; }
    public string? Pharmacology { get; set; }
    public string? DosageAdministration { get; set; }
    public string? Interaction { get; set; }
    public string? Contraindications { get; set; }
    public string? SideEffects { get; set; }
    public string? PregnancyLactation { get; set; }
    public string? PrecautionsWarnings { get; set; }
    public string? TherapeuticClass { get; set; }
    public string? StorageConditions { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}
