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
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugCompanyService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";


    public async Task<PaginatedListViewModel<DrugCompanyViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugCompany.GetListAsync(take, skip);
        var viewModels = mapper.Map<List<DrugCompanyViewModel>>(list);
        return new PaginatedListViewModel<DrugCompanyViewModel>(take) { ItemList = viewModels };
    }

    public async Task<DrugCompanyViewModel?> GetDetailsAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugCompany.GetDetailsAsync(int.Parse(id));
        return mapper.Map<DrugCompanyViewModel>(entity);
    }

    public async Task<DrugCompanyDto?> GetByIdAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugCompany.FindByIdAsync(int.Parse(id));
        if (entity is not null)
        {
            entity.EncryptedId = id;
            return mapper.Map<DrugCompanyDto>(entity);
        }
        return default;
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
        var existing = await repository.DrugCompany.FindByIdAsync(int.Parse(dto.EncryptedId!));
        if (existing is null) return false;
        mapper.Map(dto, existing);
        UpdateAutoFields(existing);
        return await repository.DrugCompany.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string id)
    {
        if (!IsValidId(id)) return false;
        var existing = await repository.DrugCompany.FindByIdAsync(int.Parse(id));
        if (existing is null) return false;
        existing.IsActive = !existing.IsActive;
        UpdateAutoFields(existing);
        return await repository.DrugCompany.UpdateAsync(existing);
    }

    public async Task<List<DrugCompanyDto>> GetActiveListAsync()
    {
        var list = await repository.DrugCompany.GetActiveListAsync();
        return mapper.Map<List<DrugCompanyDto>>(list);
    }
}
