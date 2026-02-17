using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class DrugType : BaseEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? CommonUsage { get; set; }   
   
    public virtual ICollection<DrugDetail> DrugDetails { get; set; } = new List<DrugDetail>();
}
