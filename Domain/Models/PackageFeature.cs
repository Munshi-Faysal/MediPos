using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class PackageFeature : BaseEntity
{
    public int PackageId { get; set; }
    public int FeatureId { get; set; }
    

    public virtual Package? Package { get; set; }
    public virtual Feature? Feature { get; set; }
}
