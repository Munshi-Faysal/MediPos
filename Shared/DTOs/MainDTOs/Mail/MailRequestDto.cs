using Microsoft.AspNetCore.Http;

namespace Shared.DTOs.MainDTOs.Mail;

public class MailRequestDto : BaseMailDto
{
    public string? ModuleName { get; set; }
    public required string RequestNo { get; set; }
    public required string Status { get; set; }
    public string? RequestApprovalComment { get; set; }
    public string? CategoryName { get; set; }
    public string? SubCategoryName { get; set; }
    public required string UrlString { get; set; }
    public required string EmailFormatType { get; set; }

    public IEnumerable<string> ToEmailList { get; set; } = [];
    public IEnumerable<IFormFile> AttachmentList { get; set; } = [];
}