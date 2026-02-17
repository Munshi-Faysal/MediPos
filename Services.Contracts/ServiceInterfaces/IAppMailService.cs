using Shared.DTOs.MainDTOs.Mail;

namespace Services.Contracts.ServiceInterfaces;

public interface IAppMailService
{
    Task<bool> SendEmailAsync(MailRequestDto mailRequestDto);
    Task<bool> SendEmailAsync(MailOtpDto mailOtpDto);
    Task<bool> SendEmailAsync(MailConfirmationDto mailConfirmationDto);
    Task<bool> SendEmailAsync(CompanyRegistrationMailDto registrationMailDto);
}