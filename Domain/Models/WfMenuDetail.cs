using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class WfMenuDetail : BaseEntityNonActivable
{
    public int MenuMasterId { get; set; }
    public int BranchMappingId { get; set; }

    [NotMapped]
    public bool IsAuthorized { get; set; }

    public virtual WfMenuMaster? MenuMaster { get; set; }
}