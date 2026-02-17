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

internal sealed class GenericService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IGenericService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";


    public async Task<PaginatedListViewModel<GenericViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.Generic.GetListAsync(take, skip);
        var viewModels = mapper.Map<List<GenericViewModel>>(list);
        return new PaginatedListViewModel<GenericViewModel>(take) { ItemList = viewModels };
    }

    public async Task<GenericViewModel?> GetDetailsAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.Generic.GetDetailsAsync(int.Parse(id));
        return mapper.Map<GenericViewModel>(entity);
    }

    public async Task<GenericDto?> GetByIdAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.Generic.FindByIdAsync(int.Parse(id));
        if (entity is not null)
        {
            entity.EncryptedId = id;
            return mapper.Map<GenericDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(GenericDto dto)
    {
        var entity = mapper.Map<Generic>(dto);
        CreateAutoFields(entity);
        return await repository.Generic.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(GenericDto dto)
    {
        if (!IsValidId(dto.EncryptedId)) return false;
        var existing = await repository.Generic.FindByIdAsync(int.Parse(dto.EncryptedId!));
        if (existing is null) return false;
        mapper.Map(dto, existing);
        UpdateAutoFields(existing);
        return await repository.Generic.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string id)
    {
        if (!IsValidId(id)) return false;
        var existing = await repository.Generic.FindByIdAsync(int.Parse(id));
        if (existing is null) return false;
        existing.IsActive = !existing.IsActive;
        UpdateAutoFields(existing);
        return await repository.Generic.UpdateAsync(existing);
    }

    public async Task<List<GenericDto>> GetActiveListAsync()
    {
        var list = await repository.Generic.GetActiveListAsync();
        return mapper.Map<List<GenericDto>>(list);
    }
}