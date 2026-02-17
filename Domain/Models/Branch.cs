using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class Branch : BaseEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string? Code { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public int? DivisionId { get; set; }

    
}
