using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Mail;

public class MailConfirmationDto : BaseMailDto
{
    public required string ConfirmationLink { get; set; }
}