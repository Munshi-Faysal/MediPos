using System.ComponentModel.DataAnnotations;

namespace Domain.Models.BaseModels;

public class BaseEntity : BaseEntityNonActivable
{
    [Required]
    [Display(Name = "Active")]
    public bool IsActive { get; set; }
}