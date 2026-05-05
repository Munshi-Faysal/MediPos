using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DrugCompanyService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugCompanyService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";


    public async Task<PaginatedListViewModel<DrugCompanyViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugCompany.GetListAsync(take, skip);
        var listAsList = list.ToList();
        var viewModels = mapper.Map<List<DrugCompanyViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugCompanyViewModel>(take) { ItemList = viewModels };
    }

    public async Task<DrugCompanyViewModel?> GetDetailsAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugCompany.GetDetailsAsync(encryptionHelper.Decrypt(id));
        return mapper.Map<DrugCompanyViewModel>(entity);
    }

    public async Task<DrugCompanyDto?> GetByIdAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugCompany.FindByIdAsync(encryptionHelper.Decrypt(id));
        if (entity is not null)
        {
            entity.EncryptedId = id;
            return mapper.Map<DrugCompanyDto>(entity);
        }
        return default;
    }

    public async Task<bool> IsNameExistsAsync(string name, string? encryptedExcludeId = null)
    {
        if (!string.IsNullOrEmpty(encryptedExcludeId) && IsValidId(encryptedExcludeId))
        {
            var id = encryptionHelper.Decrypt(encryptedExcludeId);
            return await repository.DrugCompany.AnyAsync(x => x.Id != id && x.Name.Trim().ToLower() == name.Trim().ToLower());
        }
        return await repository.DrugCompany.AnyAsync(x => x.Name.Trim().ToLower() == name.Trim().ToLower());
    }

    public async Task<bool> CreateAsync(DrugCompanyDto dto)
    {
        var entity = mapper.Map<DrugCompany>(dto);
        CreateAutoFields(entity);
        return await repository.DrugCompany.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugCompanyDto dto)
    {
        if (!IsValidId(dto.EncryptedId)) return false;

        var id = encryptionHelper.Decrypt(dto.EncryptedId!);
        var existing = await repository.DrugCompany.FindByIdAsync(id);
        if (existing is null) return false;
        mapper.Map(dto, existing);
        existing.Id = id;
        UpdateAutoFields(existing);
        return await repository.DrugCompany.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string id)
    {
        if (!IsValidId(id)) return false;
        var existing = await repository.DrugCompany.FindByIdAsync(encryptionHelper.Decrypt(id));
        if (existing is null) return false;
        existing.IsActive = !existing.IsActive;
        UpdateAutoFields(existing);
        return await repository.DrugCompany.UpdateAsync(existing);
    }

    public async Task<List<DrugCompanyDto>> GetActiveListAsync()
    {
        var list = await repository.DrugCompany.GetActiveListAsync();
        var dtos = mapper.Map<List<DrugCompanyDto>>(list);
        for (int i = 0; i < dtos.Count; i++)
        {
            dtos[i].EncryptedId = encryptionHelper.Encrypt(list[i].Id.ToString());
        }
        return dtos;
    }
}
