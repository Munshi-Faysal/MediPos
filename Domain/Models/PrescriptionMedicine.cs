using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class PrescriptionMedicine : BaseEntity
{
    [Required]
    public int PrescriptionId { get; set; }
    [ForeignKey(nameof(PrescriptionId))]
    public virtual Prescription? Prescription { get; set; }

    [Required]
    public int DrugDetailId { get; set; }
    [ForeignKey(nameof(DrugDetailId))]
    public virtual DrugDetail? DrugDetail { get; set; }

    [Required]
    public string Dosage { get; set; } = string.Empty; // e.g., 1+0+1

    public string? Frequency { get; set; }

    [Required]
    public string Duration { get; set; } = string.Empty;

    public string? Instructions { get; set; }

    public decimal Quantity { get; set; }
}
