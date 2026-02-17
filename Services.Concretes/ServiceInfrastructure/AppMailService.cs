using Domain.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MimeKit;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Common;
using Shared.DTOs.MainDTOs.Mail;
using Shared.Enums;

namespace Services.Concretes.ServiceInfrastructure;

public sealed class AppMailService(IOptions<MailSettings> mailSettings,
    IOptions<EnvironmentVariables> environmentVariables,
    IRepositoryManager repository,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : BaseService(userManager, httpContextAccessor), IAppMailService
{
    private readonly MailSettings _mailSettings = mailSettings.Value;
    private readonly EnvironmentVariables _environmentVariables = environmentVariables.Value;

    public async Task<bool> SendEmailAsync(MailRequestDto mailRequestDto)
    {
        var email = new MimeMessage
        {
            Sender = MailboxAddress.Parse(_mailSettings.EmailAddress)
        };

        var emailFormat = await repository.EmailFormat.GetAllByEmailFormatTypeAsync(mailRequestDto.EmailFormatType);

        if (emailFormat is not null)
        {
            var approvalComment = "";
            var rejectReturnApproval = "";

            var subjectSuffix = mailRequestDto.Status.Equals(nameof(RequestStatus.InProgress))
                ? mailRequestDto.InitiatorName
                : CurrentUser!.DisplayName;

            email.Subject = $"{mailRequestDto.ModuleName} - {emailFormat.EmailSubject} {subjectSuffix}";

            if (mailRequestDto.Status.Equals(nameof(RequestActivity.Reject))
                || mailRequestDto.Status.Equals(nameof(RequestActivity.Return)))
            {
                approvalComment = $"<tr><td> Comment </td><td>: {mailRequestDto.RequestApprovalComment}</td></tr>";
                rejectReturnApproval = $"<tr><td> {WordConverter.ConvertToPastTense(mailRequestDto.Status).ToLower()} by </td><td>: {CurrentUser!.DisplayName}</td></tr>";
            }

            var spiltMainBody = emailFormat.EmailBody.Split('|');
            var spiltBody = spiltMainBody[0].Split('/');
            string emailTemplate = await GetEmailTemplateAsync(mailRequestDto.EmailTemplate);

            emailTemplate = emailTemplate.Replace("@CompanyName", _environmentVariables.OrganizationName);
            emailTemplate = emailTemplate.Replace("@BodyFormat", spiltBody[0]);
            emailTemplate = emailTemplate.Replace("@CprNo", mailRequestDto.RequestNo);
            emailTemplate = emailTemplate.Replace("@Category", mailRequestDto.CategoryName);
            emailTemplate = emailTemplate.Replace("@SubCategory", mailRequestDto.SubCategoryName);
            emailTemplate = emailTemplate.Replace("@Link", mailRequestDto.UrlString);
            emailTemplate = emailTemplate.Replace("@Subject", email.Subject);
            emailTemplate = emailTemplate.Replace("@Time", DateTime.Now.ToLongDateString());
            emailTemplate = emailTemplate.Replace("@LogoUrl", spiltMainBody[1]);
            emailTemplate = emailTemplate.Replace("@RequestApprovalComment", approvalComment);
            emailTemplate = emailTemplate.Replace("@RequestApprovalUser", rejectReturnApproval);
            emailTemplate = emailTemplate.Replace("@InitiatorUserEmailBody", mailRequestDto.InitiatorName);
            emailTemplate = emailTemplate.Replace("@CurrentUserEmailBody", CurrentUser!.DisplayName);

            var builder = new BodyBuilder();

            foreach (var attachment in mailRequestDto.AttachmentList)
            {
                if (attachment.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await attachment.CopyToAsync(ms);
                    var fileBytes = ms.ToArray();
                    builder.Attachments.Add(attachment.FileName, fileBytes, ContentType.Parse(attachment.ContentType));
                }
            }

            var mailSent = false;       //Need to configure for unsent mail resending later...
            foreach (var recipient in mailRequestDto.ToEmailList)
            {
                email.To.Add(MailboxAddress.Parse(recipient));
                emailTemplate = emailTemplate.Replace("@UserName", await repository.User.GetDisplayNameByEmailAsync(recipient));
                builder.HtmlBody = $"<p>{emailTemplate}</p>";
                email.Body = builder.ToMessageBody();
                mailSent = await SendSmtpMailAsync(email);
            }
            return mailSent;
        }
        return false;
    }

    public async Task<bool> SendEmailAsync(MailOtpDto mailOtpDto)
    {
        string emailTemplate = await GetEmailTemplateAsync(mailOtpDto.EmailTemplate);

        emailTemplate = emailTemplate.Replace("@CompanyName", _environmentVariables.OrganizationName);
        emailTemplate = emailTemplate.Replace("@UserName", mailOtpDto.InitiatorName);
        emailTemplate = emailTemplate.Replace("@Time", DateTime.Now.ToLongDateString());
        emailTemplate = emailTemplate.Replace("@OTPCode", mailOtpDto.Otp);
        emailTemplate = emailTemplate.Replace("@OTPLifetime", "5");

        var builder = new BodyBuilder { HtmlBody = $"<p>{emailTemplate}</p>" };

        var email = new MimeMessage
        {
            Sender = MailboxAddress.Parse(_mailSettings.EmailAddress),
            Body = builder.ToMessageBody(),
            Subject = mailOtpDto.Subject,
            To = { MailboxAddress.Parse(mailOtpDto.ToEmail) }
        };
        return await SendSmtpMailAsync(email);
    }

    public async Task<bool> SendEmailAsync(MailConfirmationDto mailConfirmationDto)
    {
        string emailTemplate = await GetEmailTemplateAsync(mailConfirmationDto.EmailTemplate);

        emailTemplate = emailTemplate.Replace("@CompanyName", _environmentVariables.OrganizationName);
        emailTemplate = emailTemplate.Replace("@UserName", mailConfirmationDto.InitiatorName);
        emailTemplate = emailTemplate.Replace("@Time", DateTime.Now.ToLongDateString());
        emailTemplate = emailTemplate.Replace("@ConfirmationLink", mailConfirmationDto.ConfirmationLink);

        var builder = new BodyBuilder { HtmlBody = $"<p>{emailTemplate}</p>" };

        var email = new MimeMessage
        {
            Sender = MailboxAddress.Parse(_mailSettings.EmailAddress),
            Body = builder.ToMessageBody(),
            Subject = mailConfirmationDto.Subject,
            To = { MailboxAddress.Parse(mailConfirmationDto.ToEmail) }
        };
        return await SendSmtpMailAsync(email);
    }

    public async Task<bool> SendEmailAsync(CompanyRegistrationMailDto registrationMailDto)
    {
        string emailTemplate = await GetEmailTemplateAsync(registrationMailDto.EmailTemplate);

        emailTemplate = emailTemplate.Replace("@CompanyName", _environmentVariables.OrganizationName);
        emailTemplate = emailTemplate.Replace("@UserName", registrationMailDto.InitiatorName);
        emailTemplate = emailTemplate.Replace("@OrganizationName", registrationMailDto.OrganizationName);
        emailTemplate = emailTemplate.Replace("@Time", DateTime.Now.ToLongDateString());
        
        if (!string.IsNullOrEmpty(registrationMailDto.BillingCycleDate))
            emailTemplate = emailTemplate.Replace("@BillingCycleDate", registrationMailDto.BillingCycleDate);
            
        if (!string.IsNullOrEmpty(registrationMailDto.RejectionReason))
            emailTemplate = emailTemplate.Replace("@RejectionReason", registrationMailDto.RejectionReason);

        var builder = new BodyBuilder { HtmlBody = $"<p>{emailTemplate}</p>" };

        var email = new MimeMessage
        {
            Sender = MailboxAddress.Parse(_mailSettings.EmailAddress),
            Body = builder.ToMessageBody(),
            Subject = registrationMailDto.Subject,
            To = { MailboxAddress.Parse(registrationMailDto.ToEmail) }
        };
        return await SendSmtpMailAsync(email);
    }

    private async Task<bool> SendSmtpMailAsync(MimeMessage email)
    {
        try
        {
            using var smtpClient = new SmtpClient();
            await smtpClient.ConnectAsync(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);
            await smtpClient.AuthenticateAsync(_mailSettings.Username, _mailSettings.Password);
            await smtpClient.SendAsync(email);
            await smtpClient.DisconnectAsync(true);

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    private static async Task<string> GetEmailTemplateAsync(string templateName)
    {
        var assembly = typeof(EmailTemplates).Assembly;
        var resourceName = $"Shared.EmailTemplates.{templateName}.html";
        await using var stream = assembly.GetManifestResourceStream(resourceName);
        using var reader = new StreamReader(stream!);
        return await reader.ReadToEndAsync();
    }
}