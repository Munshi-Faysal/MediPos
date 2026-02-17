using Domain.Models.BaseModels;

namespace Domain.Models;

public class WfMenuMaster : BaseEntity
{
    public string MenuName { get; set; } = null!;
    public string? MenuPath { get; set; }
    public string? MenuIcon { get; set; }
    public int? ParentMenuId { get; set; }

    public virtual WfMenuMaster? ParentMenu { get; set; }

    public virtual ICollection<WfMenuMaster> InverseParentMenu { get; set; } = new List<WfMenuMaster>();
    public virtual ICollection<WfMenuDetail> WfMenuDetails { get; set; } = new List<WfMenuDetail>();
}