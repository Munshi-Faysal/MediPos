using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.BaseDTOs;

public class BaseViewModelDetail : BaseViewModel
{
    [Display(Name = "Author")]
    public string? Creator { get; set; }

    [Display(Name = "Modifier")]
    public string? Modifier { get; set; }

    [Display(Name = "Created Date")]
    public DateTime? CreatedDate { get; set; }

    [Display(Name = "Modified Date")]
    public DateTime? UpdatedDate { get; set; }
}