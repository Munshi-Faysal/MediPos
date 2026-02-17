using Domain.Models.BaseModels;

namespace Domain.Models;

public partial class DrugDetail: BaseEntity
{
    public int DrugMasterId { get; set; }
    public int DrugStrengthId { get; set; }
    public int DrugTypeId { get; set; }

    public virtual DrugMaster? DrugMaster { get; set; }
    public virtual DrugType? DrugType { get; set; }
    public virtual DrugStrength? DrugStrength { get; set; }

    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
}
