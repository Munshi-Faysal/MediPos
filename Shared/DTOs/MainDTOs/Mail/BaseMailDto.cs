namespace Shared.DTOs.MainDTOs.Mail;

public class BaseMailDto
{
    public required string EmailTemplate { get; set; }
    public required string InitiatorName { get; set; }
    public string Subject { get; set; } = null!;
    public string ToEmail { get; set; } = null!;
}