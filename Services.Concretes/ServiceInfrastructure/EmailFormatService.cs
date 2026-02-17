using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure.WorkflowEngine;

internal sealed class EmailFormatService(UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IEmailFormatService
{
    public async Task<PaginatedListViewModel<EmailFormatViewModel>?> GetListAsync(int take, int skip)
    {
        var emailFormatList = await repository.EmailFormat.GetListAsync(take, skip);
        var emailFormatListAsList = emailFormatList.ToList();

        var emailFormatViewModels = mapper.Map<List<EmailFormatViewModel>>(emailFormatListAsList);

        return new PaginatedListViewModel<EmailFormatViewModel>(take)
        {
            ItemList = emailFormatViewModels
        };
    }

    public async Task<EmailFormatViewModel?> GetDetailsAsync(string encryptedId)
    {
        var emailFormat = await repository.EmailFormat.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<EmailFormatViewModel>(emailFormat);
    }

    public async Task<EmailFormatDto?> GetByIdAsync(string encryptedId)
    {
        var emailFormat = await repository.EmailFormat.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (emailFormat is not null)
        {
            emailFormat.EncryptedId = encryptedId;
            return mapper.Map<EmailFormatDto>(emailFormat);
        }
        return default;
    }

    public async Task<bool> CreateAsync(EmailFormatDto emailFormatDto)
    {
        var emailFormat = mapper.Map<WfEmailFormat>(emailFormatDto);

        emailFormat.CreatedDate = emailFormat.UpdatedDate = DateTime.Now;
        emailFormat.CreatedBy = emailFormat.UpdatedBy = CurrentUser!.Id;

        return await repository.EmailFormat.InsertAsync(emailFormat);
    }

    public async Task<bool> UpdateAsync(EmailFormatDto emailFormatDto)
    {
        var emailFormat = mapper.Map<WfEmailFormat>(emailFormatDto);

        var encryptedId = emailFormat.EncryptedId ?? string.Empty;

        var existingEmailFormat = await repository.EmailFormat.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existingEmailFormat is null)
            return false;

        emailFormat.Id = existingEmailFormat.Id;
        emailFormat.CreatedDate = existingEmailFormat.CreatedDate;
        emailFormat.CreatedBy = existingEmailFormat.CreatedBy;
        emailFormat.UpdatedDate = DateTime.Now;
        emailFormat.UpdatedBy = CurrentUser!.Id;

        return await repository.EmailFormat.UpdateAsync(emailFormat);
    }
}