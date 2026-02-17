using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class WfBaseKeyword
{
    [Key]
    public int Id { get; set; }

    [StringLength(20)]
    [Display(Name = "Keyword Type")]
    [Required]
    public string KeywordType { get; set; } = null!;

    [StringLength(50)]
    [Display(Name = "Keyword Code")]
    [Required]
    public string KeywordCode { get; set; } = null!;

    [Display(Name = "Sequence")]
    [Required]
    public int? Sequence { get; set; }

    [StringLength(50)]
    [Display(Name = "Keyword Text")]
    [Required]
    public string KeywordText { get; set; } = null!;

    [Required]
    [Display(Name = "Active")]
    public bool IsActive { get; set; }


    public virtual ICollection<ApplicationRole> ApplicationRoles { get; set; } = new List<ApplicationRole>();
    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}