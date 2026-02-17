using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class EmailFormatViewModel : BaseViewModel
{
    [Display(Name = "Email-Format Type")]
    public string? EmailFormatType { get; set; }

    [Display(Name = "Email Subject")]
    public string? EmailSubject { get; set; }

    [Display(Name = "Email Body")]
    public string? EmailBody { get; set; }
}