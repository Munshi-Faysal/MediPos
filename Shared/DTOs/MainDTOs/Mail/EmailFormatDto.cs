using Domain.Models;
using Domain.ValidationAttributes;
using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Mail;

public class EmailFormatDto : UniqueDto
{
    [StringLength(50)]
    [Display(Name = "Email-Format Type")]
    [Required]
    [Unique<WfEmailFormat>]
    public string EmailFormatType { get; set; } = null!;

    [StringLength(250)]
    [Display(Name = "Email Subject")]
    [Required]
    public string EmailSubject { get; set; } = null!;

    [StringLength(1000)]
    [Display(Name = "Email Body")]
    [Required]
    public string EmailBody { get; set; } = null!;
}