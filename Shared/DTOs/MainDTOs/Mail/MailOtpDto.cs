using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Mail;

public class MailOtpDto : BaseMailDto
{
    public required string Otp { get; set; }
}