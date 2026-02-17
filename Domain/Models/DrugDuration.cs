using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class DrugDuration : BaseEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    public int TotalDay { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    
}
