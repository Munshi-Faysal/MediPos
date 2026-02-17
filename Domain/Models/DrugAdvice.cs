using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class DrugAdvice : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public int? DoctorId { get; set; }


    public virtual Doctor? Doctor { get; set; }
}
