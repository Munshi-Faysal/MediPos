using Domain.Models.BaseModels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public partial class DrugCompany : BaseEntity
{
    [Required]
    [StringLength(200)]
    [Display(Name = "Company Name")]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Display Order")]
    public int DisplayOrder { get; set; }

    public virtual ICollection<DrugMaster> DrugMasters { get; set; } = new List<DrugMaster>();
}
