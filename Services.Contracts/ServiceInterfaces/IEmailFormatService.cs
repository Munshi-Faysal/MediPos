using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IEmailFormatService : IBaseService<EmailFormatViewModel, EmailFormatDto>;