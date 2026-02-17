using Domain.Models.BaseModels;

namespace Domain.Models;

public partial class Unit : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public virtual ICollection<DrugStrength> DrugStrengths { get; set; } = new List<DrugStrength>();
}
