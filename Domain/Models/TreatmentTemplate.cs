using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class TreatmentTemplate : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    public int DoctorId { get; set; }
    public virtual Doctor? Doctor { get; set; }

    public virtual ICollection<TreatmentDrug> TreatmentDrugs { get; set; } = new List<TreatmentDrug>();
}
