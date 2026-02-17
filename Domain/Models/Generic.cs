using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public partial class Generic:BaseEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Indication { get; set; }

    [StringLength(500)]
    public string? SideEffects { get; set; }

    public virtual ICollection<DrugMaster> DrugMasters { get; set; } = new List<DrugMaster>();
}
