using Domain.Models;
using Domain.Models.BaseModels;

namespace Domain.Models;

public partial class DrugMaster: BaseEntity
{

    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public int DrugCompanyId { get; set; }
    public string? Description { get; set; }
    public int? DrugGenericId { get; set; }    

    public virtual Generic? Generic { get; set; }
    public virtual DrugCompany? DrugCompany { get; set; }

    public virtual ICollection<DrugDetail> DrugDetails { get; set; } = new List<DrugDetail>();
}
