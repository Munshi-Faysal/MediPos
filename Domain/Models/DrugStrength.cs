using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class DrugStrength : BaseEntity
{
    [Required]
    [StringLength(100)]
    public string Quantity { get; set; } = null!;
    public int UnitId { get; set; }

    public virtual Unit? Unit { get; set; }

    public virtual ICollection<DrugDetail> DrugDetails { get; set; } = new List<DrugDetail>();
}
