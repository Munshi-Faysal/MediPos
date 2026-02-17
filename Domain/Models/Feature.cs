using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class Feature : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public virtual ICollection<PackageFeature> PackageFeatures { get; set; } = new List<PackageFeature>();
}
